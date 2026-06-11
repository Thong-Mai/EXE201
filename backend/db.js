import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

let sequelize;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL if DATABASE_URL env variable is provided (deployments like Render, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: isProduction ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Fallback to SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

// 1. User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user' // user | staff | admin
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  subscription: {
    type: DataTypes.STRING,
    defaultValue: 'Free' // Free | Premium | Mentor | Mentor+
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active' // Active | Pending KYC | Rejected KYC | Blocked
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  idIssueDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  riskProfile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  onboardingAnswers: {
    type: DataTypes.TEXT, // Stringified JSON
    allowNull: true
  },
  balance: {
    type: DataTypes.DOUBLE,
    defaultValue: 100000000 // 100M VND starting cash for simulation
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// 2. Watchlist Model
const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 3. Portfolio Model
const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shares: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  buyPrice: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  }
});

// 4. Goal Model
const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  target: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  current: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monthlyContribution: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  }
});

// 5. Course Model
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING
  },
  duration: {
    type: DataTypes.STRING
  },
  level: {
    type: DataTypes.STRING
  },
  difficulty: {
    type: DataTypes.STRING
  },
  timeEstimated: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.TEXT // Stringified JSON array
  },
  description: {
    type: DataTypes.TEXT
  },
  lessons: {
    type: DataTypes.TEXT // Stringified JSON array of lesson objects
  },
  quizzes: {
    type: DataTypes.TEXT // Stringified JSON array of quiz questions
  }
});

// 6. CourseProgress Model
const CourseProgress = sequelize.define('CourseProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lessonsRead: {
    type: DataTypes.TEXT, // Stringified JSON array of lesson IDs
    defaultValue: '[]'
  },
  quizCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  progressPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// 7. PaymentRequest Model
const PaymentRequest = sequelize.define('PaymentRequest', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetTier: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending' // Pending | Approved | Rejected
  },
  note: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// 8. Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 9. Otp Model
const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

// Define Relationships
User.hasMany(Watchlist, { onDelete: 'CASCADE', foreignKey: 'userId' });
Watchlist.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Portfolio, { onDelete: 'CASCADE', foreignKey: 'userId' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { onDelete: 'CASCADE', foreignKey: 'userId' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CourseProgress, { onDelete: 'CASCADE', foreignKey: 'userId' });
CourseProgress.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PaymentRequest, { onDelete: 'CASCADE', foreignKey: 'userId' });
PaymentRequest.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { onDelete: 'CASCADE', foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize,
  User,
  Watchlist,
  Portfolio,
  Goal,
  Course,
  CourseProgress,
  PaymentRequest,
  Notification,
  Otp
};
