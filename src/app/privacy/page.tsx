'use client';

import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { FadeIn } from '@/components/FadeIn';

export default function PrivacyPage() {
  return (
    <>
      <Navigation heroTheme="dark" scrollThreshold={100} />

      {/* White spacer behind navbar */}
      <div className="bg-white h-[80px] lg:h-[155px]" />

      {/* Blue header */}
      <section style={{ backgroundColor: '#5170ff' }} className="pt-10 lg:pt-14 pb-8 -mt-px">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeIn>
            <h1
              className="font-times font-bold text-4xl lg:text-6xl uppercase"
              style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
            >
              Privacy Policy
            </h1>
            <p className="font-inter mt-3 text-sm lg:text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Last Updated: March 21, 2026
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[780px] mx-auto px-6">
          <style dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            .legal-body, .legal-body * {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
            .legal-body h2 {
              font-family: var(--font-inter), sans-serif;
              font-size: 28px;
              font-weight: 700;
              color: #1b1b1b !important;
              margin-top: 2.5em;
              margin-bottom: 0.8em;
              letter-spacing: -0.03em;
            }
            .legal-body h2:first-child {
              margin-top: 0;
            }
            .legal-body h3 {
              font-family: var(--font-inter), sans-serif;
              font-size: 22px;
              font-weight: 700;
              color: #1b1b1b !important;
              margin-top: 1.8em;
              margin-bottom: 0.6em;
            }
            .legal-body p {
              font-size: 18px !important;
              font-weight: 400 !important;
              line-height: 1.9 !important;
              margin-bottom: 1.5em !important;
              color: #333 !important;
            }
            .legal-body ul, .legal-body ol {
              font-size: 18px;
              font-weight: 400;
              line-height: 1.9;
              color: #333 !important;
              margin-bottom: 1.5em;
              padding-left: 1.5em;
            }
            .legal-body li {
              margin-bottom: 0.5em;
              color: #333 !important;
            }
            .legal-body a {
              color: #5170ff !important;
              text-decoration: underline;
            }
            .legal-body strong {
              font-weight: 700;
              color: #1b1b1b !important;
            }
            .legal-body table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1.5em;
              font-size: 16px;
            }
            .legal-body th, .legal-body td {
              border: 1px solid #e0e0e0;
              padding: 10px 14px;
              text-align: left;
              vertical-align: top;
            }
            .legal-body th {
              background: #f5f5f5;
              font-weight: 700;
              color: #1b1b1b !important;
            }
          ` }} />


            <div className="legal-body font-inter" style={{ color: '#1b1b1b' }}>

              <p>
                COBALT NEWS LLC (&quot;Thorium Valley,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                respects your privacy and values your trust. This Privacy Policy (&quot;Policy&quot;) describes
                how we collect and use your information and explains your rights and options. This Policy applies
                to these services (which we call the &quot;Services&quot;):
              </p>
              <ul>
                <li>ThoriumValley.com website and associated subdomains</li>
                <li>Our newsletters and other distributed content</li>
                <li>Related social media pages</li>
                <li>Anywhere else we gather information about you and refer to this Policy</li>
              </ul>
              <p>
                This Policy is grouped into: information we collect, how we use it, when we disclose it,
                your rights, and other important information. We encourage you to read this Policy carefully.
                If you have questions, please contact us at{' '}
                <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a>.
              </p>


              {/* ─── 1. ABOUT THIS POLICY ─── */}
              <h2>1. About This Policy</h2>

              <h3>Who We Are</h3>
              <p>
                COBALT NEWS LLC (&quot;Thorium Valley,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                operates the Services. This Policy supplements and is governed by
                our <a href="/terms">Terms of Service</a> (&quot;Terms&quot;). Capitalized terms used but not
                defined in this Policy are defined in our Terms.
              </p>

              <h3>When This Policy Applies</h3>
              <p>
                This Policy applies when you use the Services, effective as of the Last Updated date above.
                By using or accessing the Services, you signify that you have read, understand, and agree to
                be bound by this Policy and the Terms.
              </p>
              <p>
                Because the Services change often, this Policy may change over time. Anytime we modify the
                Policy, we will post a revised version on the Services and update the Last Updated date above.
                If you have given us your contact information, we will notify you before any material changes
                take effect so you have time to review them.
              </p>
              <p>
                The Services may contain links to and from third-party websites and services. This Policy
                does not apply outside of our Services. See &quot;Third-Party Services&quot; below.
              </p>

              <h3>Location-Specific Sections</h3>
              <p>
                The Services operate from the United States, but this Policy applies worldwide. Your rights
                and choices depend in part on the law where you live. For example, you may have rights under:
                (1) &quot;GDPR&quot;: the General Data Protection Regulation (EU) 2016/679; or (2) &quot;CCPA&quot;:
                the California Consumer Privacy Act, as amended by the CPRA. Where those sections apply to you,
                they override any contrary descriptions elsewhere in this Policy.
              </p>


              {/* ─── 2. INFORMATION WE COLLECT ─── */}
              <h2>2. Information We Collect</h2>

              <h3>Information You Provide</h3>
              <p>
                You may use the Services without providing any information about yourself. However, to use
                some aspects of the Services (such as subscribing to our newsletter), we will need information
                about you. Information you provide may include your <strong>email address</strong> or other
                contact information (&quot;personal identifiers&quot;).
              </p>
              <p>
                We generally do not collect sensitive information, and we strive to limit the amount of
                personal information we collect to what is necessary.
              </p>

              <h3>Information Collected When You Use the Services</h3>
              <p>
                As you use the Services, cookies and other technologies generate technical data about which
                features you use, how you use them, and the devices you use to access our services. This
                information may include:
              </p>
              <ul>
                <li><strong>Device Information:</strong> your device&apos;s IP address, browser type and version,
                  operating system, internet service provider, and device configuration</li>
                <li><strong>Internet Activity:</strong> pages you visit, links you click, time spent on pages, the
                  sites you use before or after visiting ours, general geolocation information, and
                  timestamps</li>
                <li><strong>Newsletter Engagement:</strong> email open rates, click-through rates, and subscription
                  status, collected through our email service provider</li>
              </ul>

              <h3>Information We Generate</h3>
              <p>
                We may infer new information from other data we collect, including using automated means to
                generate information about your likely preferences or other characteristics.
              </p>


              {/* ─── 3. HOW WE USE YOUR INFORMATION ─── */}
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the categories of personal information described above for the following purposes:
              </p>
              <ul>
                <li><strong>To deliver our content:</strong> Send you our newsletter, deliver content you
                  request, and communicate with you about our services</li>
                <li><strong>To manage subscriptions:</strong> Process your newsletter subscription and send
                  transactional emails about your account</li>
                <li><strong>To improve our services:</strong> Analyze usage patterns, review engagement data,
                  debug errors, and develop new content and features</li>
                <li><strong>To measure advertising:</strong> Perform and measure the effectiveness of advertising
                  campaigns on and off the Services</li>
                <li><strong>To prevent fraud:</strong> Find and address violations of our Terms and protect the
                  security of our Services</li>
                <li><strong>To ensure legal compliance:</strong> Comply with legal requirements and assist law
                  enforcement when required</li>
              </ul>


              {/* ─── 4. DISCLOSURES TO THIRD PARTIES ─── */}
              <h2>4. Our Disclosures of Information to Others</h2>

              <h3>With Service Providers</h3>
              <p>
                We contract with service providers to fulfill certain functionality and features of the
                Services. We may disclose information about you to service providers as necessary for them
                to perform their services. Service providers are not permitted to use information about you
                for any other purpose. Our service providers include:
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Data Received</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Beehiiv</strong></td>
                    <td>Newsletter delivery, subscriber management, and email analytics</td>
                    <td>Email address, open/click data, device info, engagement metrics</td>
                  </tr>
                  <tr>
                    <td><strong>Vercel</strong></td>
                    <td>Website hosting and performance optimization</td>
                    <td>IP address, page views, traffic data, performance metrics</td>
                  </tr>
                  <tr>
                    <td><strong>Meta (Facebook)</strong></td>
                    <td>Advertising measurement and conversion tracking via Meta Pixel</td>
                    <td>IP address, browser info, page views, conversion events (e.g., newsletter signups)</td>
                  </tr>
                  <tr>
                    <td><strong>Google Fonts</strong></td>
                    <td>Typography rendering</td>
                    <td>IP address, browser/user agent information</td>
                  </tr>
                </tbody>
              </table>

              <h3>For Advertising</h3>
              <p>
                We share information with advertising partners to measure the effectiveness of advertising
                and to market the Services. In the past twelve months, we have shared the following categories
                of personal information with third parties for advertising purposes:
              </p>
              <ul>
                <li>Device Information</li>
                <li>Internet Activity</li>
                <li>General Geolocation</li>
              </ul>

              <h3>For Legal Reasons</h3>
              <p>
                We may disclose personal information: (a) in response to subpoenas, court orders, or other
                legal process; (b) to establish or exercise our legal rights or defend against legal claims;
                (c) when we believe it is appropriate to investigate, prevent, or take action regarding illegal
                activities or violations of our Terms; or (d) in connection with a corporate transaction such
                as a merger, acquisition, or asset sale.
              </p>


              {/* ─── 5. COOKIES AND TRACKING ─── */}
              <h2>5. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to operate the Services and collect information. These include:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for basic website functionality such as
                  authentication and security. These cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our
                  website, including which pages are visited most often and how users navigate the site.</li>
                <li><strong>Advertising Cookies:</strong> Used by our advertising partners (such as Meta) to
                  measure the effectiveness of ad campaigns and track conversions. The Meta Pixel collects data
                  such as page views and conversion events (e.g., newsletter signups) to help us measure ad
                  performance.</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to block or
                delete cookies. However, blocking cookies may affect the functionality of the Services.
              </p>


              {/* ─── 6. DATA RETENTION ─── */}
              <h2>6. How Long We Retain Your Information</h2>
              <p>
                We retain your information only as long as we need it for the purposes described in this
                Policy, except when longer retention is required by applicable legal, tax, accounting, or
                regulatory requirements. For example, we retain your email address for as long as you remain
                subscribed to our newsletter. If you unsubscribe, we may retain limited records for compliance
                and fraud-prevention purposes.
              </p>


              {/* ─── 7. YOUR RIGHTS (GENERAL) ─── */}
              <h2>7. Your Rights</h2>

              <h3>In General</h3>
              <p>
                We want you to be in control of your information. The following options are available to you:
              </p>
              <ul>
                <li><strong>Unsubscribe:</strong> You may opt-out of our newsletter at any time by clicking
                  the unsubscribe link in any email. We may continue to send you administrative or transactional
                  communications.</li>
                <li><strong>Data Deletion:</strong> You may request deletion of your personal data by contacting
                  us at <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a>.</li>
                <li><strong>Personalized Ads:</strong> For more about targeted advertising and how to opt out,
                  visit the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">
                  DAA Webchoices Browser Check</a> and the{' '}
                  <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">
                  NAI Opt Out of Interest-Based Advertising</a>.</li>
              </ul>


              {/* ─── 8. GDPR RIGHTS ─── */}
              <h2>8. Rights Under GDPR</h2>
              <p>
                This section applies to you only if you reside in a jurisdiction where GDPR applies (such as
                the EU, UK, or Switzerland).
              </p>

              <h3>Lawful Bases</h3>
              <p>
                If we are aware that you reside in a GDPR jurisdiction, we only collect, use, or share
                information about you when we have a valid reason (&quot;lawful basis&quot;). Our lawful bases include:
              </p>
              <ul>
                <li>The <strong>consent</strong> you provide at the point of collection</li>
                <li>The <strong>performance of the contract</strong> we have with you (our Terms of Service)</li>
                <li><strong>Compliance with a legal obligation</strong> to which we are subject</li>
                <li>The <strong>legitimate interests</strong> of Thorium Valley, such as administering our
                  business, preventing fraud, and conducting marketing</li>
              </ul>

              <h3>Your GDPR Rights</h3>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul>
                <li><strong>Request access</strong> to the personal data we hold about you</li>
                <li><strong>Request correction</strong> of incomplete or inaccurate data</li>
                <li><strong>Request erasure</strong> of your personal data where there is no legitimate reason
                  for us to continue processing it</li>
                <li><strong>Object to processing</strong> where we are relying on a legitimate interest</li>
                <li><strong>Request restriction</strong> of processing in certain scenarios</li>
                <li><strong>Request data portability</strong> — we will provide your data in a structured,
                  commonly used, machine-readable format</li>
                <li><strong>Withdraw consent</strong> at any time where we are relying on consent to process
                  your data</li>
              </ul>
              <p>
                We do not charge for access to your personal data or to exercise any of these rights. However,
                we may refuse to comply with requests that are clearly unfounded, repetitive, or excessive.
                For GDPR purposes, the data controller is COBALT NEWS LLC, organized in California, United States.
              </p>


              {/* ─── 9. CCPA RIGHTS ─── */}
              <h2>9. Rights Under California Law</h2>
              <p>
                This section applies to you if you reside in California or another U.S. state with comparable
                data privacy laws. We extend these rights to residents of other U.S. states with similar privacy
                legislation.
              </p>

              <h3>Your CCPA Rights</h3>
              <p>Under the California Consumer Privacy Act (as amended by the CPRA), you have the right to:</p>
              <ul>
                <li><strong>Know and Access:</strong> Request that we disclose the personal information we have
                  collected about you, including the categories and sources of information, our purposes for
                  collecting it, and the categories of third parties with whom we share it.</li>
                <li><strong>Delete:</strong> Request that we delete personal information we have collected about you,
                  subject to certain exceptions.</li>
                <li><strong>Correct:</strong> Request that we correct inaccurate personal information.</li>
                <li><strong>Opt-Out of Sale/Sharing:</strong> Direct us not to sell or share your personal information.
                  We do not sell personal information as defined by CCPA.</li>
                <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your
                  CCPA rights.</li>
              </ul>

              <h3>Categories of Personal Information Collected</h3>
              <p>
                In the past twelve months, we have collected personal information for the following CCPA categories
                of business and commercial purposes:
              </p>
              <ul>
                <li>Providing products or services (newsletter delivery)</li>
                <li>Advertising and marketing</li>
                <li>Internal research and analytics</li>
                <li>Security and error management</li>
              </ul>

              <h3>Preference Signals</h3>
              <p>
                The Services are designed to recognize and honor global opt-out preference signals (such as
                Global Privacy Control) sent through browser or device settings, in compliance with applicable
                law. Please contact us at{' '}
                <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a>{' '}
                if you believe we processed your information inconsistently with your opt-out preference signal.
              </p>

              <h3>How to Submit a Request</h3>
              <p>
                To submit a CCPA rights request, contact{' '}
                <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a>{' '}
                with &quot;California Privacy Rights Request&quot; in the subject line. We will acknowledge your
                request within 10 days and fulfill it within 45 days. We may require up to an additional
                45 days if necessary, with an explanation of the delay.
              </p>


              {/* ─── 10. INTERNATIONAL DATA TRANSFERS ─── */}
              <h2>10. International Data Transfers</h2>
              <p>
                If you reside outside the United States, we transfer information about you for processing
                in the United States. By providing your information to us, you consent to the processing of
                your information in the United States. When we transfer personal data subject to GDPR, we use
                standard contractual clauses approved by the EU or another appropriate transfer mechanism.
              </p>


              {/* ─── 11. CHILDREN'S PRIVACY ─── */}
              <h2>11. Children&apos;s Privacy</h2>
              <p>
                The Services are intended for adult users. We do not knowingly collect information from anyone
                under the age of 18 in the United States or under the age of 16 in jurisdictions where GDPR
                applies. We do not share or sell information about anyone under 16 without affirmative
                authorization. If we learn that we have collected information from a child under the applicable
                minimum age, we will delete that information as quickly as possible.
              </p>
              <p>
                If you are under 18, please do not use the Services. If you are a parent or guardian and
                believe your child has provided us with information, please contact us at{' '}
                <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a>.
              </p>


              {/* ─── 12. SECURITY ─── */}
              <h2>12. Security</h2>
              <p>
                Thorium Valley has implemented technical, administrative, and physical security measures to
                protect your information from unauthorized access, use, or disclosure. However, no data
                transmission over the Internet is completely secure, and we cannot guarantee the security of
                any information you provide. You transmit information to us at your own risk. We are not
                responsible for the circumvention of any privacy settings or security measures we may provide.
              </p>


              {/* ─── 13. THIRD-PARTY SERVICES ─── */}
              <h2>13. Third-Party Services</h2>
              <p>
                Some areas of the Services contain links to third-party websites, resources, and advertisers.
                These third parties are not part of the Services. We do not control (and are not responsible for)
                third-party content or privacy practices. Information you provide to them is not covered by this
                Policy. We encourage you to familiarize yourself with their privacy policies and terms of use.
              </p>


              {/* ─── 14. CONTACT ─── */}
              <h2>14. Contact Us</h2>
              <p>
                If you have any questions or feedback about this Privacy Policy, please contact us at:
              </p>
              <p>
                <strong>COBALT NEWS LLC</strong><br />
                Attn: Privacy<br />
                Email: <a href="mailto:privacy@thoriumvalley.com">privacy@thoriumvalley.com</a><br />
                3400 Cottage Way, Ste G2 #31260<br />
                Sacramento, California 95825
              </p>

            </div>


        </div>
      </section>

      <FooterNew />
    </>
  );
}
