export interface UserInfo {
  id: string;
  token: string;
}

export const getUserInfo = (): UserInfo | null => {
  try {
    // First try to get userInfo (new format)
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      console.log('Found userInfo:', parsed);
      return parsed;
    }

    // Fallback to old format (user + token)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      console.log('Found old format user data:', { token, user });
      
      // Convert to new format and save it
      const newUserInfo: UserInfo = {
        id: user.id,
        token: token
      };
      setUserInfo(newUserInfo);
      console.log('Converted and saved new format:', newUserInfo);
      return newUserInfo;
    }

    console.log('No user data found in localStorage');
    return null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

export const setUserInfo = (userInfo: UserInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  console.log('Saved userInfo:', userInfo);
};

export const clearUserInfo = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Cleared all user data');
};

export const isLoggedIn = (): boolean => {
  const userInfo = getUserInfo();
  const loggedIn = userInfo !== null;
  console.log('isLoggedIn check:', loggedIn);
  return loggedIn;
}; 