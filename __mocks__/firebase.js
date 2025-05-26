module.exports = {
  db: {},
  authInstance: {
    fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve([])),
  },
};
