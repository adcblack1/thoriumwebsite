'use client';

import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { FadeIn } from '@/components/FadeIn';

export default function TermsPage() {
  return (
    <>
      <Navigation heroTheme="dark" scrollThreshold={100} />

      {/* White spacer behind navbar */}
      <div className="bg-white h-[80px] lg:h-[155px]" />

      {/* Blue header — matches /newsletter and /articles */}
      <section style={{ backgroundColor: '#5170ff' }} className="pt-10 lg:pt-14 pb-8 -mt-px">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeIn>
            <h1
              className="font-times font-bold text-4xl lg:text-6xl uppercase"
              style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
            >
              Terms of Service
            </h1>
            <p className="font-inter mt-3 text-sm lg:text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Last Updated: March 21, 2026
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Body — article-style typography */}
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
            .legal-body .caps-notice {
              text-transform: uppercase;
              font-weight: 600;
              font-size: 16px;
              line-height: 1.8;
              color: #333 !important;
              background: #f5f5f5;
              padding: 1.2em 1.5em;
              border-left: 4px solid #5170ff;
              margin-bottom: 1.5em;
            }
          ` }} />


            <div className="legal-body font-inter" style={{ color: '#1b1b1b' }}>

              <p>
                COBALT NEWS LLC (&quot;Thorium Valley,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates ThoriumValley.com
                and related services, which include our newsletters, website, and related social media pages
                (collectively, the &quot;Services&quot;).
              </p>

              <p>
                These Terms of Service form part of the overall &quot;Agreement&quot; between you and us, which also includes:
                (1) our <a href="/privacy">Privacy Policy</a>, which explains how we collect and use your information; and
                (2) any additional terms specific to particular Services that may be presented to you when you access those Services.
              </p>

              <p><strong>By using the Services, you agree to be bound by this Agreement.</strong></p>


              {/* ─── 1. MODIFICATIONS ─── */}
              <h2>1. Modifications to the Agreement</h2>
              <p>
                We may modify this Agreement from time to time, and such modifications will be effective upon posting
                on the Services. You will be deemed to have agreed to any such modifications by your further use of
                the Services after any such modification is posted. It is therefore important that you review this
                Agreement regularly to ensure you are updated as to any changes. If you do not agree with the
                modifications, please discontinue use of the Services immediately.
              </p>


              {/* ─── 2. ARBITRATION NOTICE ─── */}
              <h2>2. Arbitration Notice</h2>
              <div className="caps-notice">
                PLEASE NOTE THAT THESE TERMS CONTAIN AN ARBITRATION CLAUSE. BY AGREEING TO THESE TERMS OF SERVICE,
                YOU AGREE (A) TO RESOLVE ALL DISPUTES WITH US THROUGH BINDING INDIVIDUAL ARBITRATION, WHICH MEANS
                THAT YOU WAIVE ANY RIGHT TO HAVE THOSE DISPUTES DECIDED BY A JUDGE OR JURY, AND (B) THAT YOU WAIVE
                YOUR RIGHT TO PARTICIPATE IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS. YOU HAVE
                THE RIGHT TO OPT-OUT OF ARBITRATION AS EXPLAINED IN SECTION 10.
              </div>


              {/* ─── 3. DESCRIPTION OF SERVICES ─── */}
              <h2>3. Description of Services</h2>
              <p>
                Thorium Valley provides a daily artificial intelligence briefing delivered via email newsletter
                and published on our website. Our Services include curated news, analysis, and commentary about
                artificial intelligence and related technology developments. The Services are currently offered
                free of charge.
              </p>


              {/* ─── 4. CONTENT AND PROPRIETARY RIGHTS ─── */}
              <h2>4. Content and Proprietary Rights</h2>

              <h3>Proprietary Rights</h3>
              <p>
                All materials contained on the Services, including all content, software, graphics, text,
                and the look and feel of the Services, and all trademarks, copyrights, patents, and other
                intellectual property rights related thereto (&quot;Proprietary Materials&quot;), are owned or controlled
                by Thorium Valley, our subsidiaries or affiliated companies, our contributors, and/or our
                third-party licensors.
              </p>
              <p>
                You may not modify, remove, delete, augment, add to, publish, transmit, participate in the
                transfer or sale of, create derivative works from, or in any way exploit any Proprietary
                Materials, or any other protectable aspects of the Services, in whole or in part, unless
                specifically stated otherwise.
              </p>
              <p>
                Subject to your compliance with this Agreement, we grant you a non-exclusive, non-transferable,
                revocable limited license to access and use the Services and Proprietary Materials for your own
                non-commercial personal purposes consistent with the intended purpose of the Services. You agree
                not to use the Services for any other purpose.
              </p>

              <h3>Third-Party Content</h3>
              <p>
                You acknowledge that the Services may include content provided by third parties, including
                our contributors. Any opinions, advice, statements, or other information expressed or made
                available by third parties are those of the respective authors and not of Thorium Valley or
                its affiliates. We neither endorse nor are responsible for any third-party content posted
                to or referenced by the Services.
              </p>


              {/* ─── 5. USER CONDUCT ─── */}
              <h2>5. User Conduct</h2>
              <p>
                You agree to use the Services only for lawful purposes. Specific prohibited activities include,
                but are not limited to:
              </p>
              <ul>
                <li>Engaging in or encouraging criminal or tortious activity, including fraud, trafficking in
                  obscene or illegal material, harassment, stalking, or spamming</li>
                <li>Engaging in conduct that is abusive, threatening, obscene, defamatory, or libelous</li>
                <li>Posting or sharing content that constitutes copyright infringement, patent infringement,
                  or theft of trade secrets</li>
                <li>Attempting to circumvent, disable, or otherwise interfere with security-related features
                  of the Services</li>
                <li>Using any software that intercepts, mines, or otherwise collects information about other
                  users or copies and stores any Proprietary Materials</li>
                <li>Interfering with, disrupting, or creating an undue burden on the Services or the networks
                  or services connected to the Services</li>
                <li>Attempting to impersonate another user or person</li>
                <li>Soliciting personal information from anyone under 18</li>
                <li>Using information obtained from the Services to harass, abuse, or harm another person</li>
                <li>Using the Services in a commercial manner without our express written permission</li>
              </ul>


              {/* ─── 6. NEWSLETTER SUBSCRIPTIONS ─── */}
              <h2>6. Newsletter Subscriptions</h2>
              <p>
                To receive our newsletter, you must provide a valid email address. You are responsible for
                maintaining the accuracy of your contact information. Newsletter subscriptions are currently
                free and can be cancelled at any time by clicking the unsubscribe link in any newsletter email
                or by contacting us at <a href="mailto:legal@thoriumvalley.com">legal@thoriumvalley.com</a>.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue the newsletter (or any part thereof)
                at any time, with or without notice. We shall not be liable to you or any third party for any
                modification, suspension, or discontinuation of the newsletter.
              </p>


              {/* ─── 7. THIRD-PARTY LINKS ─── */}
              <h2>7. Third-Party Links</h2>
              <p>
                The Services may contain links or otherwise direct you to websites operated by third parties.
                We do not monitor or control the linked sites and make no representations regarding, and are
                not liable or responsible for, the accuracy, completeness, timeliness, reliability, or
                availability of any content, products, or services available at these sites. If you choose
                to access any third-party site, you do so at your own risk. The presence of a link to a
                third-party site does not constitute or imply our endorsement, sponsorship, or recommendation
                of the third party or its content.
              </p>
              <p>
                We reserve the right to disable links to third-party sites at any time.
              </p>


              {/* ─── 8. DISCLAIMERS AND LIMITATION OF LIABILITY ─── */}
              <h2>8. Disclaimers and Limitation of Liability</h2>
              <div className="caps-notice">
                THE SERVICES ARE PROVIDED BY US ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. TO THE FULLEST EXTENT
                PERMISSIBLE BY APPLICABLE LAW, WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING BUT NOT LIMITED TO,
                IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </div>
              <div className="caps-notice">
                WITHOUT LIMITING THE FOREGOING, NEITHER WE NOR ANY THIRD-PARTY PROVIDER MAKES ANY REPRESENTATION
                OR WARRANTY OF ANY KIND, EXPRESS OR IMPLIED: (I) AS TO THE OPERATION OF THE SERVICES, OR THE
                INFORMATION, CONTENT, MATERIALS, OR PRODUCTS INCLUDED THEREON; (II) THAT USE OF THE SERVICES
                WILL BE SECURE, UNINTERRUPTED, OR ERROR-FREE; (III) AS TO THE ACCURACY, RELIABILITY, OR CURRENCY
                OF ANY INFORMATION, CONTENT, OR SERVICE PROVIDED THROUGH THE SERVICES; OR (IV) THAT THE SERVERS,
                OR EMAILS SENT FROM OR ON BEHALF OF US, ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </div>
              <div className="caps-notice">
                WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING
                FROM THE USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                UNDER NO CIRCUMSTANCES WILL WE BE LIABLE TO YOU FOR MORE THAN THE AMOUNT YOU HAVE PAID US IN
                THE ONE HUNDRED AND EIGHTY (180) DAYS IMMEDIATELY PRECEDING THE DATE ON WHICH YOU FIRST ASSERT
                ANY SUCH CLAIM. IF YOU HAVE NOT PAID ANY AMOUNTS DURING THAT TIME PERIOD, YOUR SOLE REMEDY IS
                TO CEASE USING THE SERVICES AND TERMINATE YOUR ACCOUNT.
              </div>
              <p>
                Our content is for informational purposes only and should not be construed as professional,
                financial, legal, or investment advice. Certain state laws do not allow limitations on implied
                warranties or the exclusion or limitation of certain damages. If these laws apply to you, some
                or all of the above disclaimers, exclusions, or limitations may not apply, and you may have
                additional rights.
              </p>


              {/* ─── 9. DMCA / COPYRIGHT POLICY ─── */}
              <h2>9. Copyright Policy</h2>
              <p>
                We respect the intellectual property rights of others and expect our users to do the same. If
                you believe that any content on our Services infringes your copyright, please send a written
                notification to our designated copyright agent at
                {' '}<a href="mailto:legal@thoriumvalley.com">legal@thoriumvalley.com</a>{' '}
                with the following information:
              </p>
              <ul>
                <li>A description of the copyrighted work that you claim has been infringed</li>
                <li>A description of where the allegedly infringing material is located on the Services</li>
                <li>Your address, telephone number, and email address</li>
                <li>A statement that you have a good-faith belief that the disputed use is not authorized by
                  the copyright owner, its agent, or the law</li>
                <li>A statement, made under penalty of perjury, that the information in your notice is accurate
                  and that you are the copyright owner or authorized to act on the copyright owner&apos;s behalf</li>
                <li>Your physical or electronic signature</li>
              </ul>


              {/* ─── 10. DISPUTE RESOLUTION ─── */}
              <h2>10. Dispute Resolution and Binding Arbitration</h2>
              <p>
                Any controversy or claim arising out of or relating to this Agreement, including any threshold
                questions of arbitrability, will be determined by binding arbitration. The arbitration proceedings
                will be held and conducted by a single arbitrator in accordance with the Comprehensive Arbitration
                Rules and Procedures of JAMS (the &quot;JAMS Rules&quot;), as modified by this Agreement.
              </p>
              <p>
                Such arbitration will occur in Sacramento, California, and be initiated by any party in
                accordance with the JAMS Rules. The demand for arbitration will be made within a reasonable
                time after the claim or dispute has arisen, and in any event will not be made after the date
                when institution of legal proceedings would be barred by the applicable statute of limitations.
              </p>
              <p>
                The arbitrator will issue a written opinion that includes the factual and legal basis for any
                decision and award. The arbitrator will apply the substantive law of the State of California
                or federal law, as applicable to the claim(s) asserted. Judgment on the award may be entered
                in any court of competent jurisdiction.
              </p>
              <p>
                The arbitrator will allocate all costs and expenses of the arbitration (including legal and
                accounting fees) to the parties in proportions that reflect their relative success on the merits.
              </p>
              <p>
                <strong>You agree to pursue any arbitration in an individual capacity and not as a class
                representative or class member in any purported class action proceeding.</strong>
              </p>
              <div className="caps-notice">
                BY AGREEING TO ARBITRATE DISPUTES, THE PARTIES HEREBY ACKNOWLEDGE AND AGREE THAT THEY ARE
                IRREVOCABLY WAIVING ANY AND ALL RIGHT TO TRIAL BY JURY IN ANY LEGAL PROCEEDING ARISING OUT
                OF OR RELATING TO THIS AGREEMENT.
              </div>

              <h3>Opt-Out Right</h3>
              <p>
                You have the right to opt out of binding arbitration within 30 days of the date you first
                accepted the terms of this section by emailing{' '}
                <a href="mailto:legal@thoriumvalley.com">legal@thoriumvalley.com</a>. In order to be effective,
                the opt-out notice must include your full name and clearly indicate your intent to opt out of
                binding arbitration. By opting out of binding arbitration, you are agreeing to resolve disputes
                in accordance with Section 11 (Governing Law and Jurisdiction).
              </p>


              {/* ─── 11. GOVERNING LAW ─── */}
              <h2>11. Governing Law and Jurisdiction</h2>
              <p>
                The Services are created and controlled by us in the State of California. The laws of the
                State of California will govern this Agreement, without giving effect to any provisions of
                California law that direct the choice of another state&apos;s laws.
              </p>
              <p>
                Subject to the Binding Arbitration section above, you hereby irrevocably and unconditionally
                consent to submit to the exclusive jurisdiction of the federal and state courts in Sacramento
                County, California for any litigation arising out of or relating to use of the Services (and
                agree not to commence any litigation relating thereto except in such courts).
              </p>


              {/* ─── 12. INDEMNITY ─── */}
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify and hold Thorium Valley, COBALT NEWS LLC, our parent company,
                subsidiaries and affiliates, and our respective officers, agents, partners, and employees,
                harmless from any loss, liability, claim, or demand, including reasonable attorneys&apos; fees,
                made by any third party due to or arising out of your breach of this Agreement and/or any
                of your representations and warranties set forth herein.
              </p>


              {/* ─── 13. ADDITIONAL TERMS ─── */}
              <h2>13. Additional Terms</h2>

              <h3>Severability</h3>
              <p>
                The provisions of this Agreement are intended to be severable. If for any reason any provision
                of this Agreement is held invalid or unenforceable in whole or in part in any jurisdiction,
                such provision will be ineffective to the extent of such invalidity or unenforceability without
                affecting the validity or enforceability of the remaining provisions.
              </p>

              <h3>Electronic Communications</h3>
              <p>
                When you use the Services or send emails to us, you are communicating with us electronically.
                You consent to receive communications from us electronically. We will communicate with you by
                email or by posting notices through the Services. You agree that all agreements, notices,
                disclosures, and other communications that we provide you electronically satisfy any legal
                requirement that such communications be in writing.
              </p>

              <h3>Assignment</h3>
              <p>
                We may assign our rights under this Agreement to any person or entity without your consent.
                You may not assign the rights under this Agreement without our prior written consent, and any
                attempt to do so is void.
              </p>

              <h3>Entire Agreement</h3>
              <p>
                This Agreement (together with the <a href="/privacy">Privacy Policy</a>) constitutes the entire
                agreement between you and Thorium Valley and governs the Services and our relationship with you.
                This Agreement supersedes any prior agreements between you and Thorium Valley.
              </p>

              <h3>No Waiver</h3>
              <p>
                Our failure to exercise or enforce any right or provision of this Agreement will not operate
                as a waiver of such right or provision. The section titles in this Agreement are for convenience
                only and have no legal or contractual effect.
              </p>


              {/* ─── 14. CONTACT ─── */}
              <h2>14. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p>
                <strong>COBALT NEWS LLC</strong><br />
                Attn: Legal Department<br />
                Email: <a href="mailto:legal@thoriumvalley.com">legal@thoriumvalley.com</a><br />
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
