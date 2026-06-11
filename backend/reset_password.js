import { User } from './db.js';
import bcrypt from 'bcryptjs';

async function reset() {
  try {
    const password = await bcrypt.hash('Password123', 10);
    const updated = await User.update(
      { password },
      { where: { email: 'nguyenvana@gmail.com' } }
    );
    console.log('Password reset successful. Rows updated:', updated);
  } catch (err) {
    console.error('Error resetting password:', err);
  }
}
reset();
