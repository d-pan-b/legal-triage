import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplesDir = path.join(__dirname, '../src/samples');

const SAMPLES = {
  'subpoena.pdf': `UNITED STATES DISTRICT COURT
NORTHERN DISTRICT OF CALIFORNIA

IN THE MATTER OF THE GRAND JURY SUBPOENA
Case No. 3:25-mj-01482

TO: CloudVault Technologies, Inc.
     Legal Compliance Department
     500 Market Street, San Francisco, CA 94105

YOU ARE COMMANDED to produce the following records and information
pursuant to 18 U.S.C. Sec. 2703(d) (Stored Communications Act):

1. All account registration information, including name, address,
   telephone number, email address, and payment method associated
   with user account ID CV-8847291, for the period January 1, 2024
   through December 31, 2024.

2. IP address logs and session metadata associated with the above
   account during the same period.

3. Transaction history and billing records linked to the account.

ISSUING AUTHORITY: United States Attorney's Office, Northern District
of California, on behalf of a federal grand jury.

RESPONSE DEADLINE: Records must be produced no later than fourteen (14)
calendar days from the date of service of this subpoena, unless otherwise
ordered by the Court.

Failure to comply may result in contempt proceedings.

Dated: April 15, 2025
/s/ Assistant United States Attorney`,

  'dmca.pdf': `DMCA SUBPOENA — 17 U.S.C. Sec. 512(h)

TO: StreamHost Platform, Inc.
    DMCA Agent / Legal Department

FROM: Harrison & Blake LLP
      Counsel for RightsHolder Media Group
      2200 Wilshire Boulevard, Los Angeles, CA 90057

RE: Copyright Infringement Investigation — User Account SH-2291044

Pursuant to 17 U.S.C. Sec. 512(h), you are required to disclose the identity
of the subscriber alleged to have infringed copyrighted works identified
as "Midnight Sessions — Live at the Forum" (Registration No. PA 3-882-441).

REQUESTED INFORMATION:
- Full legal name and contact information of the subscriber
- Email address and IP address at time of alleged infringement (March 3, 2025)
- Account creation date and any associated payment information

LEGAL BASIS: DMCA subpoena issued by counsel for the copyright owner
following a valid takedown notice under 17 U.S.C. Sec. 512(c)(3).

RESPONSE DEADLINE: Please respond within ten (10) business days of receipt.

This request does not seek content of communications beyond subscriber
identifying information as permitted under Sec. 512(h).

Respectfully submitted,
/s/ Margaret Harrison, Esq.`,

  'warrant.pdf': `SEARCH AND SEIZURE WARRANT

UNITED STATES DISTRICT COURT
EASTERN DISTRICT OF VIRGINIA

Case No. 1:25-cr-00331

TO ANY AUTHORIZED LAW ENFORCEMENT OFFICER:

The United States District Court finds probable cause that evidence of
violations of 18 U.S.C. Sec. 1030 (Computer Fraud and Abuse Act) and
18 U.S.C. Sec. 1343 (Wire Fraud) is contained within electronic records
maintained by NexaCloud Services, Inc.

YOU ARE COMMANDED to search and seize from NexaCloud Services, Inc.:

(A) The full contents of all electronic communications, including email
    messages, chat logs, and file attachments, associated with user
    accounts registered to john.doe@example.com and jane.smith@example.com,
    for the period June 1, 2024 through May 1, 2025.

(B) All stored files, metadata, and access logs for the identified accounts.

(C) Any backup or archived copies of the above data.

ISSUING AUTHORITY: Federal Bureau of Investigation, Cyber Division,
with approval of the Honorable Patricia M. Chen, U.S. Magistrate Judge.

JURISDICTION: Eastern District of Virginia

EXECUTION DEADLINE: This warrant must be executed within fourteen (14) days
of issuance. Return of seized data to the Court within thirty (30) days.

Dated: May 1, 2025
/s/ Patricia M. Chen, U.S. Magistrate Judge`,
};

function wrapLines(text, maxChars = 82) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of paragraph.split(/\s+/)) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

async function createPdf(text) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 11;
  const lineHeight = 14;
  const margin = 54;
  const pageWidth = 612;
  const pageHeight = 792;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of wrapLines(text)) {
    if (y < margin + lineHeight) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    if (line) {
      page.drawText(line, { x: margin, y: y - fontSize, size: fontSize, font });
    }
    y -= lineHeight;
  }

  return doc.save();
}

fs.mkdirSync(samplesDir, { recursive: true });

for (const [filename, content] of Object.entries(SAMPLES)) {
  const bytes = await createPdf(content);
  const outPath = path.join(samplesDir, filename);
  fs.writeFileSync(outPath, bytes);
  console.log(`Wrote ${outPath}`);
}
