require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const Resource = require('../models/Resource');

// Original mock data
const faqs = [
  {
    category: 'General',
    question: 'What is a forced marriage?',
    answer: 'A forced marriage is one where one or both people do not (or cannot) consent to the marriage and pressure or abuse is used to force them into it.'
  },
  {
    category: 'Rights',
    question: 'Is forced marriage illegal?',
    answer: 'Yes, in many jurisdictions forced marriage is a clear violation of human rights and a punishable criminal offense.'
  },
  {
    category: 'Support',
    question: 'How can I get confidential help?',
    answer: 'You can contact local helplines, designated support organizations, or emergency services. Consultations are strictly confidential.'
  },
  {
    category: 'Prevention',
    question: 'What should I do if a friend is at risk?',
    answer: 'Listen without judgment, keep their information confidential, and connect them with verified professional support resources.'
  }
];

const resources = [
  {
    title: 'Child Act 2008',
    category: 'Legal Aid',
    description: 'Section 36(2)(o) directs the government to take measures to abolish child marriage and other harmful practices. Section 34 describes reporting suspected infringements of a child’s rights to a Chief or Social Worker, local government official, police, or Public Attorney.',
    url: 'https://www.mogei.gov.ss/super/assets/documents/resources/South%20Sudan_Child%20ACT_2008_en.pdf'
  },
  {
    title: 'Ministry of Justice and Constitutional Affairs',
    category: 'Legal Aid',
    description: 'The Ministry lists Free Legal Aid among its services. Contact the Ministry and ask how to reach that service; this is not a dedicated legal-aid hotline.',
    url: 'https://mojca.gov.ss/'
  },
  {
    title: 'UNFPA South Sudan — protection services',
    category: 'Health & Protection',
    description: 'UNFPA describes women and girls’ friendly spaces, one-stop centres, and safe houses offering integrated support. Ask the office for current service locations and safe referral options before travelling.',
    url: 'https://southsudan.unfpa.org/en/topics/humanitarian-emergencies'
  },
  {
    title: 'Juba Teaching Hospital Family Protection Centre',
    category: 'Health & Protection',
    description: 'UNFPA documented this centre at Juba Teaching Hospital in a 2018 article as providing integrated medical, psychosocial, counselling, and legal support. The source is older; contact UNFPA to confirm whether it is currently operating and how to access it.',
    url: 'https://southsudan.unfpa.org/en/news/one-stop-care-centre-provides-survivor-centered-comprehensive-care-clients'
  },
  {
    title: 'UNICEF South Sudan — general office',
    category: 'Child Protection',
    description: 'Use this published office contact to ask for child-protection information or an appropriate referral. UNICEF’s public number is not identified as a dedicated emergency or forced-marriage line.',
    url: 'https://www.unicef.org/southsudan/contact'
  }
];

const seedData = async () => {
  try {
    await connectDB();
    // Upsert by stable display fields so rerunning the seed never clears user data.
    for (const faq of faqs) {
      await FAQ.updateOne({ question: faq.question }, { $setOnInsert: faq }, { upsert: true });
    }
    for (const resource of resources) {
      await Resource.updateOne({ title: resource.title }, { $setOnInsert: resource }, { upsert: true });
    }

    // Create an admin only when credentials are explicitly supplied by the operator.
    if (process.env.SEED_ADMIN_USERNAME && process.env.SEED_ADMIN_PASSWORD) {
      const existingAdmin = await User.findOne({ username: process.env.SEED_ADMIN_USERNAME });
      if (!existingAdmin) {
        await User.create({
          username: process.env.SEED_ADMIN_USERNAME,
          password: process.env.SEED_ADMIN_PASSWORD,
          role: 'admin',
        });
      }
    }
    console.log('Seed data ensured without deleting existing records.');
    await require('mongoose').disconnect();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exitCode = 1;
  }
};

seedData();
