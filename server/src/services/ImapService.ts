import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { MailMessage } from '../types';
import logger from '../utils/logger';

export class ImapService {
  generateAuthString(email: string, accessToken: string): string {
    const authString = `user=${email}\x01auth=Bearer ${accessToken}\x01\x01`;
    return Buffer.from(authString).toString('base64');
  }

  fetchMails(email: string, authString: string, mailbox = 'INBOX', top = 50): Promise<Partial<MailMessage>[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: email,
        password: '',
        xoauth2: authString,
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      } as any);

      const emailList: Partial<MailMessage>[] = [];
      let messageCount = 0;
      let processedCount = 0;

      imap.once('ready', async () => {
        try {
          await new Promise<void>((res, rej) => {
            imap.openBox(mailbox, true, (err) => (err ? rej(err) : res()));
          });

          const results: number[] = await new Promise((res, rej) => {
            imap.search(['ALL'], (err, results) => {
              if (err) return rej(err);
              const sliced = results.slice(-Math.min(top, results.length));
              res(sliced);
            });
          });

          if (results.length === 0) {
            imap.end();
            return;
          }

          messageCount = results.length;
          const f = imap.fetch(results, { bodies: '' });

          f.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream as any)
                .then((mail) => {
                  emailList.push({
                    sender: mail.from?.text || '',
                    sender_name: mail.from?.value?.[0]?.name || '',
                    subject: mail.subject || '',
                    text_content: mail.text || '',
                    html_content: mail.html || '',
                    mail_date: mail.date?.toISOString() || '',
                  });
                })
                .catch((err) => logger.error(`Error parsing email: ${err.message}`))
                .finally(() => {
                  processedCount++;
                  if (processedCount === messageCount) imap.end();
                });
            });
          });

          f.once('error', (err) => {
            logger.error(`IMAP fetch error: ${err.message}`);
            reject(err);
            imap.end();
          });
        } catch (err: any) {
          logger.error(`IMAP ready error: ${err.message}`);
          reject(err);
          imap.end();
        }
      });

      imap.once('error', (err: Error) => {
        logger.error(`IMAP connection error: ${err.message}`);
        reject(err);
      });

      imap.once('end', () => {
        logger.info(`IMAP fetched ${emailList.length} mails`);
        resolve(emailList);
      });

      imap.connect();
    });
  }

  clearMailbox(email: string, authString: string, mailbox = 'INBOX'): Promise<void> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: email,
        password: '',
        xoauth2: authString,
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      } as any);

      imap.once('ready', async () => {
        try {
          await new Promise<void>((res, rej) => {
            imap.openBox(mailbox, false, (err) => (err ? rej(err) : res()));
          });

          const results: number[] = await new Promise((res, rej) => {
            imap.search(['ALL'], (err, results) => (err ? rej(err) : res(results)));
          });

          if (results.length === 0) {
            imap.end();
            return;
          }

          await new Promise<void>((res, rej) => {
            imap.addFlags(results, ['\\Deleted'], (err) => (err ? rej(err) : res()));
          });

          await new Promise<void>((res, rej) => {
            imap.expunge((err) => (err ? rej(err) : res()));
          });

          logger.info(`IMAP cleared ${results.length} mails from ${mailbox}`);
          imap.end();
        } catch (err: any) {
          logger.error(`IMAP clear error: ${err.message}`);
          reject(err);
          imap.end();
        }
      });

      imap.once('error', (err: Error) => reject(err));
      imap.once('end', () => resolve());
      imap.connect();
    });
  }
}
