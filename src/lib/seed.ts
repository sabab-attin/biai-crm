import { getDb } from './db';
import { extractEnquiryInfo } from './ai';

export interface SampleEnquiry {
  id: number;
  channel: string;
  received_at: string;
  sender_name: string;
  phone: string;
  message: string;
}

export const SAMPLE_DATA: SampleEnquiry[] = [
  { id: 1, channel: 'WhatsApp', received_at: '2026-10-26 09:12', sender_name: 'Rafi Ahmed', phone: '01711000001', message: 'Assalamualaikum, apnader 3 day bootcamp er price koto? Payment kibhabe korbo?' },
  { id: 2, channel: 'Facebook Messenger', received_at: '2026-10-26 09:40', sender_name: 'Tahmina Akter', phone: '', message: 'ফেলোশিপ প্রোগ্রামে ভর্তি হতে চাই। কবে শুরু হবে?' },
  { id: 3, channel: 'Website form', received_at: '2026-10-26 10:05', sender_name: 'Mahmud Hasan (Managing Director, Gazipur textile company)', phone: '01711000003', message: 'I run a 40-person textile company in Gazipur. We want AI training for our team. Can someone call me this week?' },
  { id: 4, channel: 'WhatsApp', received_at: '2026-10-26 10:31', sender_name: 'Sabbir', phone: '01711000004', message: 'Vai class gula live hoy naki recorded? Recording pawa jay?' },
  { id: 5, channel: 'Phone call note', received_at: '2026-10-26 11:02', sender_name: 'Nasreen Sultana', phone: '01711000005', message: 'Called to ask about student discount. Said she will call again tomorrow after 5 PM.' },
  { id: 6, channel: 'Facebook comment', received_at: '2026-10-26 11:20', sender_name: 'Ishtiaq', phone: '', message: 'Ei course korle job pabo?' },
  { id: 7, channel: 'WhatsApp', received_at: '2026-10-26 12:48', sender_name: 'Farzana Rahman', phone: '01711000007', message: 'পেমেন্ট করেছি কিন্তু কোনো কনফার্মেশন পাইনি। আমার নাম ফারজানা রহমান। ২৫ তারিখে বিকাশে দিয়েছি।' },
  { id: 8, channel: 'Website form', received_at: '2026-10-26 13:15', sender_name: 'Anika Chowdhury', phone: '01711000008', message: 'Do you offer refunds if I cannot attend after paying?' },
  { id: 9, channel: 'Facebook Messenger', received_at: '2026-10-26 14:02', sender_name: 'Jahid', phone: '', message: 'Offline class kothay hobe? Mirpur e?' },
  { id: 10, channel: 'WhatsApp', received_at: '2026-10-26 14:30', sender_name: 'Kamrul Islam (HR, a bank in Motijheel)', phone: '01711000010', message: "Hi, I'm from a bank in Motijheel. Need a quote for training 120 employees. Online or onsite both fine." },
  { id: 11, channel: 'Facebook comment', received_at: '2026-10-26 15:10', sender_name: 'Earn Crypto Daily', phone: '', message: 'Earn 5000 USD every day with our crypto signals! Click bit.ly/xxxx now!!!' },
  { id: 12, channel: 'WhatsApp', received_at: '2026-10-27 09:05', sender_name: 'Rafi Ahmed', phone: '01711000001', message: 'Bootcamp er price ta bolen please' },
  { id: 13, channel: 'Facebook Messenger', received_at: '2026-10-27 09:44', sender_name: 'Mim', phone: '', message: 'আমি ক্লাস ৯-এ পড়ি। আমি কি ফ্রি মাস্টারক্লাসে জয়েন করতে পারব?' },
  { id: 14, channel: 'Website form', received_at: '2026-10-27 10:20', sender_name: 'Shirin Sultana', phone: '01711000013', message: 'Is the fellowship suitable for a non-technical marketing manager? I have 8 years of experience but no coding.' },
  { id: 15, channel: 'WhatsApp', received_at: '2026-10-27 11:55', sender_name: 'Tanvir', phone: '01711000014', message: 'Add-on ta ki? Lifetime access mane ki?' },
  { id: 16, channel: 'Phone call note', received_at: '2026-10-27 12:30', sender_name: 'Habibur Rahman', phone: '01711000015', message: 'Caller wants to cancel his enrolment and get his money back. Very upset. Said he will post about it on Facebook if not solved today.' },
  { id: 17, channel: 'Facebook Messenger', received_at: '2026-10-27 13:42', sender_name: 'Nowshin', phone: '', message: 'Apnader course certificate ta ki govt approved?' },
  { id: 18, channel: 'WhatsApp', received_at: '2026-10-27 14:18', sender_name: 'Rezaul Karim (owner, small garment factory)', phone: '01711000017', message: 'আমার কোম্পানির ১৫ জন কর্মীর জন্য কি গ্রুপ ডিসকাউন্ট আছে?' },
  { id: 19, channel: 'WhatsApp', received_at: '2026-10-27 15:09', sender_name: 'Samira', phone: '01711000018', message: 'Can I pay in two instalments for the fellowship?' },
  { id: 20, channel: 'Website form', received_at: '2026-10-27 16:00', sender_name: 'Arif Hossain', phone: '01711000019', message: 'Looking for a job as an AI intern. Where do I apply?' },
];

export async function seedDatabase(force: boolean = false) {
  const db = getDb();

  if (force) {
    db.exec(`
      DELETE FROM ai_feedback;
      DELETE FROM replies;
      DELETE FROM activity_log;
      DELETE FROM enquiries;
      DELETE FROM contacts;
    `);
  } else {
    const count = db.prepare('SELECT COUNT(*) as count FROM enquiries').get() as { count: number };
    if (count.count > 0) {
      return { message: 'Database already seeded', count: count.count };
    }
  }

  const insertContact = db.prepare(
    'INSERT INTO contacts (name, phone) VALUES (?, ?)'
  );

  const insertEnquiry = db.prepare(`
    INSERT INTO enquiries (
      id, contact_id, channel, received_at, original_message, language,
      interest, category, priority, status, ai_summary,
      ai_classification_reason, ai_recommended_actions,
      is_spam, is_duplicate, duplicate_of
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertActivity = db.prepare(
    'INSERT INTO activity_log (enquiry_id, contact_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  for (const item of SAMPLE_DATA) {
    // 1. Identify or create contact
    let contactId: number;
    if (item.phone) {
      const existing = db.prepare('SELECT id FROM contacts WHERE phone = ?').get(item.phone) as { id: number } | undefined;
      if (existing) {
        contactId = existing.id;
      } else {
        const result = insertContact.run(item.sender_name, item.phone);
        contactId = result.lastInsertRowid as number;
      }
    } else {
      const result = insertContact.run(item.sender_name, null);
      contactId = result.lastInsertRowid as number;
    }

    // 2. Extract intelligence via AI module
    const info = await extractEnquiryInfo(item.message, item.channel, item.sender_name, item.phone);

    // 3. Duplicate detection: check if earlier enquiry exists from the same phone
    let isDuplicate = 0;
    let duplicateOf: number | null = null;
    if (item.phone) {
      const previous = db.prepare(`
        SELECT id FROM enquiries
        WHERE contact_id = ? AND id < ?
        ORDER BY id ASC LIMIT 1
      `).get(contactId, item.id) as { id: number } | undefined;
      if (previous) {
        isDuplicate = 1;
        duplicateOf = previous.id;
      }
    }

    // Determine initial stage:
    // E.g. Kamrul Islam / Mahmud Hasan / Rafi contacted
    let status = 'New';
    if (item.id === 3) status = 'Contacted';
    if (item.id === 10) status = 'Interested';
    if (item.id === 1) status = 'Contacted';

    insertEnquiry.run(
      item.id,
      contactId,
      item.channel,
      item.received_at,
      item.message,
      info.language,
      info.interest,
      info.category,
      info.priority,
      status,
      info.summary,
      info.classification_reason,
      JSON.stringify(info.recommended_actions),
      info.is_spam ? 1 : 0,
      isDuplicate,
      duplicateOf
    );

    insertActivity.run(
      item.id,
      contactId,
      'created',
      `Inbound enquiry received via ${item.channel}`,
      item.received_at
    );
  }

  return { message: 'Database seeded successfully with smart triage', count: SAMPLE_DATA.length };
}
