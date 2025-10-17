enum MailgunRegions {
    EU = "eu",
    US = "us",
}

export type WelcomeEmail = {
    firstName?: string;
    accessAccountURL: string;
    currentDate: string;
};

export type PayByLinkEmail = {
    paymentLink: string;
};

export type VerificationEmail = {
    verificationURL: string;
};

export type ForgotPasswordEmail = {
    displayName: string;
    baseURL: string;
    currentDate: string;
};

export type EmailOptions = {
    /** sender address */
    from?: string;
    /** list of receivers */
    to: string[];
    cc?: string[];
    bcc?: string[];
    /** Subject line */
    subject: string;
    text?: string; // plain text body
    /** html body */
    html: string;
    // attachments?: { filename: string, file: Buffer }[];
    filename?: string;
};