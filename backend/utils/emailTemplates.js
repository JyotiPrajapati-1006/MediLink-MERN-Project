export const getEmailTemplate = ({ title, message, actionText, actionUrl }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            /* Basic Styles */
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background-color: #2563EB; color: #ffffff; padding: 20px; text-align: center; }
            .content { padding: 30px; color: #333333; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
           <div class="content">
                ${message}
                ${
                  actionUrl && actionText
                    ? `<p style="text-align: center; margin-top: 30px;" ><a href="${actionUrl}" style="color:#ffffff; class="button"">${actionText}</a></p>`
                    : ""
                }
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MediLink. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
