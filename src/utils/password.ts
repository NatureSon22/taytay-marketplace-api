import bcrypt from "bcrypt";

const saltRounds = 10;

const hashPassword = async (password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(`Error hashing password: ${error}`);
  }
};

const verifyPassword = async (password: string, hashedPassword: string) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.log(`Error identifying password: ${error}`);
  }
};

export { hashPassword, verifyPassword };
