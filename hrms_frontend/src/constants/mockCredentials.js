// Mock Credentials for Testing
// Replace with actual backend authentication

export const MOCK_CREDENTIALS = {
  ADMIN: {
    email: "admin@hrms.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  MANAGER: {
    email: "manager@hrms.com",
    password: "manager123",
    role: "manager",
    name: "Manager User",
  },
  EMPLOYEE: {
    email: "emp@hrms.com",
    password: "emp123",
    role: "employee",
    name: "Employee User",
  },
  DEMO: {
    email: "demo@hrms.com",
    password: "demo123",
    role: "employee",
    name: "Demo User",
  },
};

// Mock API Response
export const validateCredentials = (email, password) => {
  for (const user of Object.values(MOCK_CREDENTIALS)) {
    if (user.email === email && user.password === password) {
      return {
        success: true,
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: "mock_jwt_token_" + Date.now(),
      };
    }
  }
  return {
    success: false,
    error: "Invalid email or password",
  };
};
