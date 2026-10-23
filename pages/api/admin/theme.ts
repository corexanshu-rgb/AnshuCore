import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveTheme, DEFAULT_THEME, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      theme: store.settings.theme || DEFAULT_THEME
    });
  }

  if (req.method === 'POST') {
    const { reset, ...themeData } = req.body || {};

    if (reset) {
      const restoredTheme = await saveTheme({ ...DEFAULT_THEME });
      await logAdminAction(
        auth.user.username,
        'RESET_THEME',
        'Website Theme Settings',
        'Restored original AnshuCore light theme defaults.'
      );
      return res.status(200).json({
        success: true,
        message: 'Theme restored to original AnshuCore default.',
        theme: restoredTheme
      });
    }

    const updatedTheme = await saveTheme(themeData);
    await logAdminAction(
      auth.user.username,
      'UPDATE_THEME',
      'Website Theme Settings',
      `Updated website theme colors (Primary: ${updatedTheme.primary}, Surface: ${updatedTheme.surface})`
    );

    return res.status(200).json({
      success: true,
      message: 'Theme settings updated and persisted successfully.',
      theme: updatedTheme
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
