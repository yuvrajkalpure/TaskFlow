const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('\n==================================================');
    console.log(`✉️  [NOTIFICATION LOG]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT: ${text}`);
    console.log('==================================================\n');
    return true; // Always simulate success
  } catch (error) {
    console.error(`Mock email logger error: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
