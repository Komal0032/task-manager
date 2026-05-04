const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  try {
    console.log('Loading User model...');
    const User = require('./models/User');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected');
    
    console.log('Deleting old user...');
    await User.deleteMany({ email: 'test@example.com' });
    
    console.log('Creating user...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      role: 'Member'
    });
    
    await user.save();
    console.log(' User created! ID:', user._id);
    
    console.log('Testing password...');
    user.comparePassword('123456', (err, isMatch) => {
      if (err) {
        console.error('Error:', err);
        process.exit(1);
      }
      console.log('Password match:', isMatch);
      
      if (isMatch) {
        console.log('\n SUCCESS! Everything works!\n');
      }
      
      mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
