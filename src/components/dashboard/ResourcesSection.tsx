import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Presentation, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Video, 
  Image, 
  Star,
  TrendingUp,
  Sparkles,
  Users,
  Award,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { downloadResourcePDF } from '@/lib/resourcePdfGenerator';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'presentation' | 'video' | 'template' | 'guide';
  downloadable: boolean;
  isRecommended?: boolean;
  isMostUsed?: boolean;
  isHighestConverting?: boolean;
  usageCount?: number;
  conversionRate?: number;
  fileContent?: string; // For generating downloadable content
  externalUrl?: string; // For videos or external links
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Partner Pitch Deck',
    description: 'Professional slides to present Qbits to potential clients',
    type: 'presentation',
    downloadable: true,
    isHighestConverting: true,
    conversionRate: 34,
    fileContent: `QBITS PARTNER PITCH DECK
========================

SLIDE 1: INTRODUCTION
- Qbits: Your Digital Transformation Partner
- Empowering businesses with innovative solutions

SLIDE 2: THE PROBLEM
- Businesses struggle with digital presence
- Complex technology decisions
- Lack of technical expertise

SLIDE 3: OUR SOLUTION
- End-to-end digital solutions
- Expert team with proven track record
- Flexible engagement models

SLIDE 4: SERVICES
- Web Development & Design
- Mobile App Development
- Cloud Solutions
- Digital Marketing

SLIDE 5: WHY CHOOSE QBITS
- 500+ Successful Projects
- 98% Client Satisfaction
- 24/7 Support

SLIDE 6: PARTNER BENEFITS
- Competitive commission rates
- Real-time tracking dashboard
- Marketing support & resources

SLIDE 7: NEXT STEPS
- Sign up as a partner
- Share your unique referral link
- Earn commissions on every successful referral

Contact: partners@qbits.com`,
  },
  {
    id: '2',
    title: 'Sales Guidelines',
    description: 'Best practices and talking points for client conversations',
    type: 'pdf',
    downloadable: true,
    isMostUsed: true,
    usageCount: 2847,
    fileContent: `QBITS SALES GUIDELINES
======================

1. UNDERSTANDING YOUR PROSPECT
- Identify their pain points
- Understand their business goals
- Assess their current digital presence

2. KEY TALKING POINTS
- Qbits offers comprehensive digital solutions
- Our team has 10+ years of industry experience
- We provide ongoing support and maintenance
- Flexible pricing to fit any budget

3. HANDLING OBJECTIONS

"It's too expensive"
→ Highlight ROI and long-term value
→ Mention flexible payment options
→ Compare with cost of in-house development

"We already have a vendor"
→ Ask about their satisfaction level
→ Offer a free consultation to identify gaps
→ Propose a pilot project

"We'll think about it"
→ Create urgency with limited-time offers
→ Offer to schedule a follow-up
→ Share relevant case studies

4. CLOSING TECHNIQUES
- Summarize benefits discussed
- Ask for the commitment
- Provide clear next steps

5. FOLLOW-UP BEST PRACTICES
- Follow up within 24-48 hours
- Send relevant resources
- Stay persistent but not pushy`,
  },
  {
    id: '3',
    title: 'Demo Video',
    description: 'Product walkthrough video to share with prospects',
    type: 'video',
    downloadable: true,
    isRecommended: true,
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    fileContent: `QBITS DEMO VIDEO SCRIPT
=======================

[Introduction - 0:00-0:30]
Welcome to Qbits! We're your trusted partner for digital transformation.

[Problem Statement - 0:30-1:00]
Many businesses struggle with their digital presence...

[Solution Overview - 1:00-2:00]
Qbits offers end-to-end solutions...

[Features Showcase - 2:00-4:00]
- Custom web development
- Mobile applications
- Cloud infrastructure
- Digital marketing

[Case Studies - 4:00-5:00]
See how we've helped businesses like yours...

[Call to Action - 5:00-5:30]
Ready to transform your business? Contact us today!

Video URL: Share this link with prospects to show them our capabilities.`,
  },
  {
    id: '4',
    title: 'Email Templates',
    description: 'Pre-written emails for outreach and follow-ups',
    type: 'template',
    downloadable: true,
    isMostUsed: true,
    usageCount: 3241,
    fileContent: `QBITS EMAIL TEMPLATES
=====================

TEMPLATE 1: INITIAL OUTREACH
----------------------------
Subject: Transform Your Business with Qbits

Hi [Name],

I hope this email finds you well. I noticed that [Company] is doing great things in [Industry], and I wanted to reach out about an opportunity that could help accelerate your growth.

Qbits specializes in digital transformation solutions that have helped 500+ businesses increase their online presence and revenue.

Would you be open to a quick 15-minute call this week to explore how we might help [Company]?

Best regards,
[Your Name]

---

TEMPLATE 2: FOLLOW-UP
---------------------
Subject: Following up on Qbits

Hi [Name],

I wanted to follow up on my previous email about Qbits. I understand you're busy, so I'll keep this brief.

We recently helped [Similar Company] achieve [Specific Result], and I believe we could do the same for [Company].

Would Tuesday or Thursday work for a quick call?

Best,
[Your Name]

---

TEMPLATE 3: AFTER MEETING
-------------------------
Subject: Great speaking with you, [Name]!

Hi [Name],

Thank you for taking the time to speak with me today. I enjoyed learning about [Company] and your goals for [specific goal mentioned].

As discussed, I've attached:
- Our detailed proposal
- Relevant case studies
- Pricing information

What questions can I answer to help move forward?

Best regards,
[Your Name]

---

TEMPLATE 4: REFERRAL REQUEST
----------------------------
Subject: Quick favor to ask

Hi [Name],

I hope you've been enjoying working with Qbits! We value our partnership and always aim to exceed expectations.

I wanted to ask - do you know anyone else who might benefit from our services? We offer referral bonuses for successful introductions.

Simply share your unique referral link: [YOUR LINK]

Thank you for your continued support!

Best,
[Your Name]`,
  },
  {
    id: '5',
    title: 'Brand Assets',
    description: 'Logos, banners, and social media graphics',
    type: 'template',
    downloadable: true,
    fileContent: `QBITS BRAND ASSETS GUIDE
========================

BRAND COLORS
------------
Primary Blue: #3B82F6
Secondary Purple: #8B5CF6
Accent Green: #22C55E
Dark: #1E293B
Light: #F8FAFC

LOGO USAGE
----------
- Always maintain clear space around logo
- Minimum size: 32px height
- Use white logo on dark backgrounds
- Use dark logo on light backgrounds

SOCIAL MEDIA SIZES
------------------
LinkedIn Banner: 1584 x 396px
Twitter Header: 1500 x 500px
Facebook Cover: 820 x 312px
Instagram Post: 1080 x 1080px
Instagram Story: 1080 x 1920px

TYPOGRAPHY
----------
Headings: Inter Bold
Body: Inter Regular
Accent: Inter Semi-Bold

BRAND VOICE
-----------
- Professional yet approachable
- Confident but not arrogant
- Clear and concise
- Focus on value and results

SAMPLE SOCIAL POSTS
-------------------
"Looking for a reliable tech partner? Qbits has helped 500+ businesses transform their digital presence. Let's build something amazing together! 🚀 #DigitalTransformation"

"Another successful project delivered! Our client saw a 150% increase in online engagement. Ready for similar results? DM us! 💪 #QbitsSuccess"

Download our full brand kit from the partner portal for logos, templates, and more.`,
  },
  {
    id: '6',
    title: 'Partner Handbook',
    description: 'Complete guide to the partner program and FAQs',
    type: 'guide',
    downloadable: true,
    isRecommended: true,
    fileContent: `QBITS PARTNER HANDBOOK
======================

WELCOME TO THE QBITS PARTNER PROGRAM!

TABLE OF CONTENTS
1. Getting Started
2. Commission Structure
3. How to Refer
4. Best Practices
5. Support & Resources
6. FAQs

---

1. GETTING STARTED
------------------
Welcome aboard! As a Qbits partner, you'll earn commissions for every successful referral. Here's how to get started:

a) Complete your profile
b) Get your unique referral link
c) Start sharing with your network
d) Track your earnings in real-time

---

2. COMMISSION STRUCTURE
-----------------------
- Standard referral: 10% of project value
- Premium clients (>₹5L): 12% commission
- Recurring projects: 5% ongoing commission
- Bonus tiers for high performers

Payment Schedule:
- Commissions paid monthly
- Minimum payout: ₹1,000
- Payment via bank transfer

---

3. HOW TO REFER
---------------
Option 1: Share your unique link
Option 2: Direct introduction via email
Option 3: Fill referral form on dashboard

When a lead converts:
1. Lead signs up via your link
2. Our team contacts and qualifies
3. Project is completed
4. You receive your commission!

---

4. BEST PRACTICES
-----------------
✓ Personalize your outreach
✓ Focus on businesses needing digital help
✓ Follow up within 24 hours
✓ Use provided resources
✓ Be honest about capabilities

✗ Don't spam contacts
✗ Don't make false promises
✗ Don't share confidential info

---

5. SUPPORT & RESOURCES
----------------------
- Email: partners@qbits.com
- WhatsApp: +91 98765 43210
- Dashboard: Access 24/7
- Resources: Updated monthly

---

6. FREQUENTLY ASKED QUESTIONS
-----------------------------

Q: How long until I get paid?
A: Commissions are paid within 30 days of project completion.

Q: Can I refer international clients?
A: Yes! We work with clients worldwide.

Q: What if my referral doesn't convert immediately?
A: Links are valid for 90 days. If they convert later, you still get credit.

Q: How do I track my referrals?
A: Use your partner dashboard for real-time tracking.

Q: Can I be a partner if I'm already employed?
A: Absolutely! Most of our partners have other jobs.

---

Thank you for being a Qbits Partner!
Together, we're transforming businesses.`,
  },
  {
    id: '7',
    title: 'WhatsApp Scripts',
    description: 'Ready-to-use messages for WhatsApp outreach',
    type: 'template',
    downloadable: true,
    isHighestConverting: true,
    conversionRate: 28,
    fileContent: `QBITS WHATSAPP SCRIPTS
======================

SCRIPT 1: INITIAL CONTACT
-------------------------
Hi [Name]! 👋

I came across your business and thought you might be interested in something that's helping businesses like yours grow their digital presence.

I'm partnering with Qbits, a company that specializes in web development, apps, and digital marketing. They've helped 500+ businesses already!

Would you be open to learning more? I can share some details or connect you with their team directly.

---

SCRIPT 2: FOR STARTUPS
----------------------
Hey [Name]! 🚀

I know you're building something amazing with [Startup Name]. Wanted to share something that might help.

Qbits offers special packages for startups - professional websites, apps, the works. They understand startup budgets too!

I've been working with them and thought of you. Interested in a quick intro?

---

SCRIPT 3: FOR SMALL BUSINESSES
------------------------------
Hi [Name]! 😊

Hope business is going well! Quick question - have you considered upgrading your online presence?

I'm connected with Qbits, and they do amazing work for small businesses:
✓ Professional websites
✓ Social media management
✓ Digital marketing

They're very affordable. Want me to get more info for you?

---

SCRIPT 4: FOLLOW-UP MESSAGE
---------------------------
Hey [Name]! 

Just following up on the Qbits info I shared earlier. Did you get a chance to think about it?

Happy to answer any questions or set up a quick call with their team. No pressure at all! 😊

---

SCRIPT 5: AFTER POSITIVE RESPONSE
---------------------------------
Awesome! 🎉

Here's my referral link: [YOUR LINK]

Just click and fill out the quick form. Their team will reach out within 24 hours.

Let me know if you have any questions. Excited for you! 🙌

---

SCRIPT 6: GROUP MESSAGE (College/Community)
-------------------------------------------
Hey everyone! 👋

For those running businesses or planning to start one - check out Qbits!

They're offering:
🌐 Professional websites
📱 Mobile apps
📈 Digital marketing

I've been working with them and they're great. Here's my link if anyone's interested: [YOUR LINK]

Feel free to DM me for more info! 💬

---

TIPS FOR WHATSAPP OUTREACH:
• Keep messages short and friendly
• Use emojis sparingly but effectively
• Always personalize with their name
• Don't be pushy - one follow-up is enough
• Best times: 10-11 AM or 7-8 PM`,
  },
  {
    id: '8',
    title: 'Case Studies',
    description: 'Success stories from existing Qbits clients',
    type: 'pdf',
    downloadable: true,
    isRecommended: true,
    fileContent: `QBITS CASE STUDIES
==================

CASE STUDY 1: E-COMMERCE TRANSFORMATION
---------------------------------------
Client: FashionHub (Online Retail)
Challenge: Outdated website, poor mobile experience
Solution: Complete e-commerce redesign with React

RESULTS:
• 250% increase in online sales
• 80% improvement in mobile conversions
• 3.5s faster page load times
• 45% reduction in cart abandonment

Client Quote: "Qbits transformed our online business. The new website is beautiful and performs amazingly well."

---

CASE STUDY 2: STARTUP LAUNCH
----------------------------
Client: HealthFirst (Healthcare Startup)
Challenge: Needed MVP in 8 weeks
Solution: Full-stack web app + mobile app

RESULTS:
• Launched on time and under budget
• 10,000 users in first month
• Secured Series A funding
• Featured in TechCrunch

Client Quote: "The Qbits team delivered beyond expectations. They understood our vision perfectly."

---

CASE STUDY 3: DIGITAL MARKETING SUCCESS
---------------------------------------
Client: LocalEats (Restaurant Chain)
Challenge: Low online visibility
Solution: SEO + Social media + Google Ads

RESULTS:
• 400% increase in organic traffic
• 15,000 new Instagram followers
• 35% increase in reservations
• Top 3 Google ranking for key terms

Client Quote: "Our phones haven't stopped ringing since we started working with Qbits!"

---

CASE STUDY 4: ENTERPRISE SOLUTION
---------------------------------
Client: ManuTech (Manufacturing)
Challenge: Manual inventory management
Solution: Custom ERP system

RESULTS:
• 60% reduction in inventory errors
• 8 hours saved daily in reporting
• Real-time analytics dashboard
• ROI achieved in 4 months

Client Quote: "The system Qbits built has revolutionized our operations. Worth every rupee."

---

CASE STUDY 5: EDUCATIONAL PLATFORM
----------------------------------
Client: LearnWise (EdTech)
Challenge: Scale online courses platform
Solution: LMS with live classes feature

RESULTS:
• 50,000 students enrolled
• 99.9% uptime achieved
• 4.8/5 student satisfaction
• Expanded to 3 new countries

Client Quote: "Qbits built a platform that scales with us. Their ongoing support is exceptional."

---

SHARE THESE STORIES WITH YOUR PROSPECTS!

These case studies demonstrate our capabilities across industries. Use them to build credibility and show potential clients what's possible.

Need a specific case study for your prospect's industry? Contact partners@qbits.com`,
  },
];

interface ResourcesSectionProps {
  delay?: number;
}

export const ResourcesSection = forwardRef<HTMLDivElement, ResourcesSectionProps>(({ delay = 0 }, ref) => {
  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'presentation':
        return Presentation;
      case 'video':
        return Video;
      case 'template':
        return Image;
      case 'guide':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getIconStyles = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return 'bg-destructive/10 text-destructive';
      case 'presentation':
        return 'bg-warning/10 text-warning';
      case 'video':
        return 'bg-accent/10 text-accent';
      case 'template':
        return 'bg-chart-2/10 text-chart-2';
      case 'guide':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getFileExtension = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return 'pdf';
      case 'presentation':
        return 'pptx';
      case 'video':
        return 'txt';
      case 'template':
        return 'txt';
      case 'guide':
        return 'pdf';
      default:
        return 'txt';
    }
  };

  const handleDownload = (resource: Resource) => {
    if (!resource.fileContent) {
      toast.error('Download not available');
      return;
    }

    // Use jsPDF to generate proper PDF documents
    try {
      downloadResourcePDF(resource.title, resource.type, resource.fileContent);
      toast.success(`${resource.title} downloaded as PDF!`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleView = (resource: Resource) => {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening video...');
    } else if (resource.fileContent) {
      // For view, we can open in a new tab as text
      const blob = new Blob([resource.fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Opening document...');
    } else {
      toast.error('Resource not available');
    }
  };

  const recommendedResources = resources.filter(r => r.isRecommended);
  const mostUsedResources = resources.filter(r => r.isMostUsed);
  const highestConvertingResources = resources.filter(r => r.isHighestConverting);
  const otherResources = resources.filter(r => !r.isRecommended && !r.isMostUsed && !r.isHighestConverting);

  const renderResourceCard = (resource: Resource, index: number, sectionDelay: number) => {
    const Icon = getIcon(resource.type);
    return (
      <motion.div
        key={resource.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sectionDelay + 0.05 * index }}
        className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-300 group relative"
      >
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {resource.isRecommended && (
            <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] gap-1">
              <Sparkles className="w-3 h-3" />
              For You
            </Badge>
          )}
          {resource.isMostUsed && (
            <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px] gap-1">
              <Users className="w-3 h-3" />
              Popular
            </Badge>
          )}
          {resource.isHighestConverting && (
            <Badge className="bg-success/10 text-success border-success/20 text-[10px] gap-1">
              <Flame className="w-3 h-3" />
              Top Converting
            </Badge>
          )}
        </div>

        <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4', getIconStyles(resource.type))}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <h3 className="font-semibold text-foreground mb-1 sm:mb-2 group-hover:text-accent transition-colors text-sm sm:text-base pr-16">
          {resource.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{resource.description}</p>

        {/* Stats */}
        {(resource.usageCount || resource.conversionRate) && (
          <div className="flex items-center gap-3 mb-3 text-[10px] sm:text-xs text-muted-foreground">
            {resource.usageCount && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {resource.usageCount.toLocaleString()} uses
              </div>
            )}
            {resource.conversionRate && (
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="w-3 h-3" />
                {resource.conversionRate}% conversion
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {resource.downloadable ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs sm:text-sm"
              onClick={() => handleDownload(resource)}
            >
              <Download size={14} />
              Download
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs sm:text-sm"
              onClick={() => handleView(resource)}
            >
              <ExternalLink size={14} />
              View
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">Marketing Resources</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Everything you need to succeed as a Qbits partner</p>
      </div>

      {/* Recommended for You */}
      {recommendedResources.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recommendedResources.map((resource, index) => renderResourceCard(resource, index, delay))}
          </div>
        </div>
      )}

      {/* Highest Converting */}
      {highestConvertingResources.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Highest Converting Assets</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {highestConvertingResources.map((resource, index) => renderResourceCard(resource, index, delay + 0.1))}
          </div>
        </div>
      )}

      {/* Most Used by Top Partners */}
      {mostUsedResources.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Most Used by Top Partners</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mostUsedResources.map((resource, index) => renderResourceCard(resource, index, delay + 0.2))}
          </div>
        </div>
      )}

      {/* All Other Resources */}
      {otherResources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">All Resources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {otherResources.map((resource, index) => renderResourceCard(resource, index, delay + 0.3))}
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.4, duration: 0.4 }}
        className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-warning" />
          <h4 className="font-semibold text-foreground">Pro Tips from Top Partners</h4>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-warning">•</span>
            <span>Combine the <strong className="text-foreground">Pitch Deck</strong> with <strong className="text-foreground">Case Studies</strong> for 40% higher conversion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning">•</span>
            <span>Send <strong className="text-foreground">WhatsApp Scripts</strong> within 5 minutes of initial contact for best results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning">•</span>
            <span>Use the <strong className="text-foreground">Demo Video</strong> as a follow-up to warm leads within 24 hours</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
});

ResourcesSection.displayName = 'ResourcesSection';
