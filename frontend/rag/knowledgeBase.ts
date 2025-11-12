
import type { Document } from '../types';

export const knowledgeBase: Document[] = [
  {
    id: 'contact-support',
    source: 'https://rangamworks.com/portal/home/contact',
    content: 'Users can contact RangamWorks support for help through the contact page. The URL for the contact page is https://rangamworks.com/portal/home/contact. If a user asks for help more than twice on a topic the assistant cannot help with, they should be directed to this page.'
  },
  {
    id: 'job-search',
    source: 'https://rangamworks.com/JobSeeker/DirectorySearchJob?directory=home?utm_source=rangamworks&utm_medium=chatarbor&utm_campaign=job+search+question',
    content: 'Job seekers can search for jobs on the RangamWorks portal. The main job search URL is https://rangamworks.com/JobSeeker/DirectorySearchJob?directory=home?utm_source=rangamworks&utm_medium=chatarbor&utm_campaign=job+search+question. The assistant should provide this link when a user asks how to find jobs.'
  },
  {
    id: 'about-rangamworks',
    source: 'https://rangamworks.com/portal/home/about',
    content: 'RangamWorks is a job portal designed to connect job seekers with employers. It focuses on being inclusive, especially for job seekers who may require additional support. More information can be found at https://rangamworks.com/portal/home/about.'
  },
  {
    id: 'rangam-cares',
    source: 'https://rangam.com/rangam-cares',
    content: 'Rangam Cares is a program by Rangam that focuses on disability inclusion and support for the community. It provides resources and support for individuals with disabilities in their career journey.'
  },
  {
    id: 'reset-password',
    source: 'RangamWorks Portal Help',
    content: 'To reset your password on the RangamWorks portal, look for a "Forgot Password" link on the login page. The assistant does not need to ask for location information for queries like password resets.'
  },
  {
    id: 'scope-limitations',
    source: 'Internal Support Guidelines',
    content: 'The virtual support agent must not provide health, legal, or benefits advice, including specifics about Medicaid. If asked about these topics, the agent must respond: "I’m sorry, I can’t help with that; let me help you find the right resource (or refer you to contact us).". The agent must not request private personal information like email, SSN, or phone number.'
  }
];
