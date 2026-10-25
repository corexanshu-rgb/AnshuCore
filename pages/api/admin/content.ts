import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      content: store.websiteContent,
      categories: (store.categories && store.categories.length > 0) ? store.categories : ['Education', 'Utility', 'Games', 'Security']
    });
  }

  if (req.method === 'POST') {
    const { section, data } = req.body || {};
    if (!section || !data) {
      return res.status(400).json({ success: false, error: 'Section and data payload are required.' });
    }

    const supportedSections = ['hero', 'about', 'services', 'projects', 'seo', 'social', 'categories', 'pages', 'customPages', 'nav', 'navItems', 'navigation'];
    if (!supportedSections.includes(section) && !(section in store.websiteContent)) {
      return res.status(400).json({
        success: false,
        error: `Invalid section "${section}". Supported sections: hero, about, services, projects, seo, social, categories, pages, nav.`
      });
    }

    if (section === 'categories') {
      const { action, oldName, newName } = req.body || {};
      if (action === 'rename' && oldName && newName) {
        const cleanOld = String(oldName).trim();
        const cleanNew = String(newName).trim();
        const categories = (store.categories && store.categories.length > 0)
          ? [...store.categories]
          : ['Education', 'Productivity', 'Developer Tools', 'Utilities', 'Entertainment', 'Tools', 'Other'];
        const idx = categories.findIndex(c => c.toLowerCase() === cleanOld.toLowerCase());
        if (idx !== -1) {
          categories[idx] = cleanNew;
        } else {
          categories.push(cleanNew);
        }
        store.categories = Array.from(new Set(categories));
        let updatedCount = 0;
        store.apks.forEach(apk => {
          if (apk.category?.toLowerCase() === cleanOld.toLowerCase()) {
            apk.category = cleanNew;
            updatedCount++;
          }
        });
        await saveStore(store);
        await logAdminAction(
          auth.user.username,
          'RENAME_CATEGORY',
          cleanOld,
          `Renamed category "${cleanOld}" to "${cleanNew}" (${updatedCount} apps updated)`
        );
        return res.status(200).json({
          success: true,
          categories: store.categories,
          message: `Category "${cleanOld}" renamed to "${cleanNew}". ${updatedCount} application(s) updated.`
        });
      }

      if (Array.isArray(data)) {
        store.categories = Array.from(new Set(data.map(String).map(s => s.trim()).filter(Boolean)));
        await saveStore(store);
        await logAdminAction(
          auth.user.username,
          'UPDATE_CATEGORIES',
          'Categories',
          `Updated APK categories: ${store.categories.join(', ')}`
        );
        return res.status(200).json({
          success: true,
          categories: store.categories
        });
      }
      return res.status(400).json({ success: false, error: 'Data must be an array of category strings or provide a rename action.' });
    } else if (section === 'pages' || section === 'customPages') {
      if (Array.isArray(data)) {
        store.websiteContent.pages = data;
        await saveStore(store);
        return res.status(200).json({
          success: true,
          pages: store.websiteContent.pages,
          content: store.websiteContent
        });
      }
      return res.status(400).json({ success: false, error: 'Data must be an array of page objects.' });
    } else if (section === 'nav' || section === 'navItems' || section === 'navigation') {
      if (Array.isArray(data)) {
        store.websiteContent.navItems = data;
        await saveStore(store);
        return res.status(200).json({
          success: true,
          navItems: store.websiteContent.navItems,
          content: store.websiteContent
        });
      }
      return res.status(400).json({ success: false, error: 'Data must be an array of navigation objects.' });
    } else if (section === 'seo') {
      const sanitize = (val: any, limit: number = 300) => {
        if (typeof val !== 'string') return '';
        return val.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, limit);
      };

      const rawSeo = data || {};
      const sanitizedCanonical = sanitize(rawSeo.canonicalBase, 120).replace(/\/+$/, '') || 'https://anshucore.in';

      const sanitizedPages: Record<string, any> = {};
      if (rawSeo.pages && typeof rawSeo.pages === 'object') {
        for (const [key, p] of Object.entries(rawSeo.pages)) {
          if (p && typeof p === 'object') {
            sanitizedPages[key] = {
              title: sanitize((p as any).title, 120),
              description: sanitize((p as any).description, 320),
              noindex: Boolean((p as any).noindex)
            };
          }
        }
      }

      store.websiteContent.seo = {
        siteTitle: sanitize(rawSeo.siteTitle, 120) || 'AnshuCore — Website Development, Android Apps & Custom Software',
        description: sanitize(rawSeo.description, 320) || 'AnshuCore builds modern responsive websites, custom software, Android applications, school ERPs, and library management software.',
        keywords: sanitize(rawSeo.keywords, 300) || 'AnshuCore, website developer in Mainpuri, Android app development Uttar Pradesh, school ERP software, library management',
        canonicalBase: sanitizedCanonical.startsWith('http') ? sanitizedCanonical : 'https://anshucore.in',
        ogImage: sanitize(rawSeo.ogImage, 200) || '/assets/anshucore-og.png',
        googleSiteVerification: sanitize(rawSeo.googleSiteVerification, 120),
        pages: {
          ...(store.websiteContent.seo?.pages || {}),
          ...sanitizedPages
        }
      };
    } else {
      (store.websiteContent as any)[section] = data;
    }
    await saveStore(store);

    await logAdminAction(
      auth.user.username,
      'UPDATE_CONTENT',
      section,
      `Updated website content section "${section}"`
    );

    return res.status(200).json({
      success: true,
      message: `Section "${section}" updated successfully.`,
      content: store.websiteContent,
      categories: store.categories
    });
  }

  if (req.method === 'DELETE') {
    const { section, id, name } = req.query;
    if (!section || typeof section !== 'string') {
      return res.status(400).json({ success: false, error: 'Section parameter is required.' });
    }

    if (section === 'services') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Service ID is required.' });
      }
      const services = store.websiteContent.services || [];
      const index = services.findIndex(s => s.id === id || (s.name && s.name.toLowerCase() === id.toLowerCase()));
      if (index === -1) {
        return res.status(404).json({ success: false, error: `Service with ID "${id}" not found.` });
      }
      const removed = services.splice(index, 1)[0];
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'DELETE_SERVICE',
        removed.name,
        `Permanently removed service "${removed.name}" (ID: ${removed.id})`
      );
      return res.status(200).json({
        success: true,
        message: `Service "${removed.name}" deleted successfully.`,
        content: store.websiteContent,
        services: store.websiteContent.services
      });
    }

    if (section === 'projects') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Project ID is required.' });
      }
      const projects = store.websiteContent.projects || [];
      const index = projects.findIndex(p => p.id === id || (p.title && p.title.toLowerCase() === id.toLowerCase()));
      if (index === -1) {
        return res.status(404).json({ success: false, error: `Project with ID "${id}" not found.` });
      }
      const removed = projects.splice(index, 1)[0];
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'DELETE_PROJECT',
        removed.title,
        `Permanently removed project "${removed.title}" (ID: ${removed.id})`
      );
      return res.status(200).json({
        success: true,
        message: `Project "${removed.title}" deleted successfully.`,
        content: store.websiteContent,
        projects: store.websiteContent.projects
      });
    }

    if (section === 'categories') {
      const catTarget = (name || id || '').toString().trim();
      if (!catTarget) {
        return res.status(400).json({ success: false, error: 'Category name or ID is required.' });
      }
      const categories = (store.categories && store.categories.length > 0)
        ? store.categories
        : ['Education', 'Utility', 'Games', 'Security'];
      const catIndex = categories.findIndex(c => c.toLowerCase() === catTarget.toLowerCase());
      if (catIndex === -1) {
        return res.status(404).json({ success: false, error: `Category "${catTarget}" not found.` });
      }
      const { reassignTo } = req.query;
      // Check foreign key constraint: are any APKs currently assigned to this category?
      const matchedApks = store.apks.filter(a => a.category?.toLowerCase() === catTarget.toLowerCase());
      if (matchedApks.length > 0) {
        if (reassignTo && typeof reassignTo === 'string' && reassignTo.trim()) {
          const targetCat = reassignTo.trim();
          matchedApks.forEach(apk => {
            apk.category = targetCat;
          });
        } else {
          return res.status(400).json({
            success: false,
            error: `Cannot delete category "${catTarget}" because ${matchedApks.length} application(s) (${matchedApks.map(a => a.name).join(', ')}) belong to it. Reassign or delete those applications first.`
          });
        }
      }
      const removed = categories.splice(catIndex, 1)[0];
      store.categories = categories;
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'DELETE_CATEGORY',
        removed,
        `Removed category "${removed}"`
      );
      return res.status(200).json({
        success: true,
        message: `Category "${removed}" deleted successfully.`,
        categories: store.categories
      });
    }

    if (section === 'pages' || section === 'customPages') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Page ID is required.' });
      }
      const pages = (store.websiteContent as any).pages || [];
      const index = pages.findIndex((p: any) => p.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: `Page with ID "${id}" not found.` });
      }
      const removed = pages.splice(index, 1)[0];
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'DELETE_PAGE',
        removed.title || id,
        `Removed page "${removed.title || id}"`
      );
      return res.status(200).json({
        success: true,
        message: `Page "${removed.title || id}" deleted successfully.`,
        content: store.websiteContent
      });
    }

    if (section === 'nav' || section === 'navigation' || section === 'navItems') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Navigation item ID is required.' });
      }
      const navItems = (store.websiteContent as any).navItems || [];
      const index = navItems.findIndex((n: any) => n.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: `Navigation item with ID "${id}" not found.` });
      }
      const removed = navItems.splice(index, 1)[0];
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'DELETE_NAV_ITEM',
        removed.label || id,
        `Removed navigation item "${removed.label || id}"`
      );
      return res.status(200).json({
        success: true,
        message: `Navigation item "${removed.label || id}" deleted successfully.`,
        content: store.websiteContent
      });
    }

    return res.status(400).json({
      success: false,
      error: `Unsupported deletion section "${section}". Supported sections: services, projects, categories, pages, nav.`
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
