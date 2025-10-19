const generateVerificationCode = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = array[0] % 900000 + 100000;
  return code.toString();
};

export default generateVerificationCode;
