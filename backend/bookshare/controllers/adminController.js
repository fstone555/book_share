const User = require('../models/User');

exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body; // 'user', 'seller', 'admin'
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user });
  } catch(err) {
    res.status(500).json({ message: 'Update role error', error: err.message });
  }
};
