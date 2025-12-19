// currently only the dummy msg

export const sendWelcomeSMS = async (phone: string, name: string) => {
    // TODO: Integrate SMS Provider here (Twilio, Fast2SMS, etc.)
    console.log(`===========================================`);
    console.log(`📲 SMS SENT TO ${phone}`);
    console.log(`💬 Message: Hello ${name},Your Account is successfully created. Happy Shopping!`);
    console.log(`===========================================`);
    return true;
};

export const sendResetOTP = async (contact: string, otp: string, type: 'email' | 'phone') => {
    // Setup for both Email and SMS
    console.log(`===========================================`);
    console.log(`🚨 OTP SENT TO ${type.toUpperCase()}: ${contact}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏳ Valid for 10 minutes`);
    console.log(`===========================================`);
    return true;
};