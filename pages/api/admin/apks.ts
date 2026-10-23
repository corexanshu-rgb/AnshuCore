import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction, ApkItem } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      apks: store.apks,
      categories: (store.categories && store.categories.length > 0) ? store.categories : ['Education', 'Utility', 'Games', 'Security']
    });
  }

  if (req.method === 'POST') {
    const { id, name, slug, icon, category, repo, releaseTag, directUrl, downloadCount, sizeFormatted, isSuperApk, published, description } = req.body || {};

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Application name and slug are required.'
      });
    }

    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

    // Validate icon if supplied
    let processedIcon: string | undefined = undefined;
    if (typeof icon === 'string') {
      const trimmedIcon = icon.trim();
      if (trimmedIcon === '') {
        // Explicit removal: set safe monogram fallback
        processedIcon = cleanSlug.substring(0, 2).toUpperCase();
      } else if (trimmedIcon.startsWith('data:image/')) {
        // Validate MIME type
        const validMime = /^data:image\/(png|jpe?g|webp|svg\+xml);base64,/i.test(trimmedIcon);
        if (!validMime) {
          return res.status(400).json({
            success: false,
            error: 'Unsupported image format. Allowed formats: PNG, JPEG, WebP.'
          });
        }
        if (trimmedIcon.length > 2.5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            error: 'Uploaded icon is too large. Maximum allowed size is 1.5MB.'
          });
        }
        processedIcon = trimmedIcon;
      } else if (trimmedIcon.startsWith('http://') || trimmedIcon.startsWith('https://') || trimmedIcon.startsWith('/')) {
        processedIcon = trimmedIcon;
      } else {
        // Monogram or short code
        processedIcon = trimmedIcon.slice(0, 4).toUpperCase();
      }
    }

    if (id) {
      // Update existing
      const index = store.apks.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Application not found.' });
      }

      if (isSuperApk) {
        // Clear previous super APK
        store.apks.forEach(a => { if (a.id !== id) a.isSuperApk = false; });
      }

      const finalIcon = processedIcon !== undefined ? processedIcon : store.apks[index].icon;

      store.apks[index] = {
        ...store.apks[index],
        name: String(name).trim(),
        slug: cleanSlug,
        icon: finalIcon,
        category: category ? String(category).trim() : store.apks[index].category,
        repo: repo !== undefined ? String(repo).trim() : store.apks[index].repo,
        releaseTag: releaseTag !== undefined ? String(releaseTag).trim() : store.apks[index].releaseTag,
        directUrl: directUrl !== undefined ? String(directUrl).trim() : store.apks[index].directUrl,
        downloadCount: downloadCount !== undefined ? Number(downloadCount) : store.apks[index].downloadCount,
        sizeFormatted: sizeFormatted !== undefined ? String(sizeFormatted).trim() : store.apks[index].sizeFormatted,
        isSuperApk: Boolean(isSuperApk),
        published: Boolean(published),
        description: description !== undefined ? String(description).trim() : store.apks[index].description,
        updatedAt: new Date().toISOString().substring(0, 10)
      };

      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'UPDATE_APK',
        cleanSlug,
        `Updated details and icon for application "${name}" (published: ${published})`
      );

      return res.status(200).json({
        success: true,
        apk: store.apks[index]
      });
    } else {
      // Create new
      if (store.apks.some(a => a.slug === cleanSlug)) {
        return res.status(400).json({ success: false, error: 'An application with this slug already exists.' });
      }

      if (isSuperApk) {
        store.apks.forEach(a => (a.isSuperApk = false));
      }

      const newApk: ApkItem = {
        id: `apk-${Date.now()}`,
        name: String(name).trim(),
        slug: cleanSlug,
        icon: processedIcon || cleanSlug.substring(0, 2).toUpperCase(),
        category: category ? String(category).trim() : 'Utility',
        repo: repo ? String(repo).trim() : '',
        releaseTag: releaseTag ? String(releaseTag).trim() : 'v1.0.0',
        directUrl: directUrl ? String(directUrl).trim() : '#',
        downloadCount: Number(downloadCount) || 0,
        sizeFormatted: sizeFormatted ? String(sizeFormatted).trim() : '20.0 MB',
        isSuperApk: Boolean(isSuperApk),
        published: published !== undefined ? Boolean(published) : true,
        description: description ? String(description).trim() : '',
        updatedAt: new Date().toISOString().substring(0, 10)
      };

      store.apks.push(newApk);
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'CREATE_APK',
        cleanSlug,
        `Created new application record "${name}" with icon.`
      );
      await logAdminAction(
        auth.user.username,
        'CREATE_APK',
        cleanSlug,
        `Created new application "${name}" (Category: ${newApk.category})`
      );

      return res.status(201).json({
        success: true,
        apk: newApk
      });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Application ID is required.' });
    }

    const index = store.apks.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    const removed = store.apks.splice(index, 1)[0];
    if (removed.isSuperApk && store.apks.length > 0) {
      const nextSuper = store.apks.find(a => a.published) || store.apks[0];
      if (nextSuper) nextSuper.isSuperApk = true;
    }

    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      'DELETE_APK',
      removed.slug,
      `Permanently removed application "${removed.name}"`
    );

    return res.status(200).json({
      success: true,
      message: `Application "${removed.name}" removed successfully.`,
      apks: store.apks
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

