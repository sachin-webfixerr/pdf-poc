const { degrees, PDFDocument, rgb } = require("pdf-lib");
const pdf = require("html-pdf");
const fs = require("fs");

const createSignPage = (signers) => {
  let r = `
    <html>

    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- So that mobile will display zoomed in -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- enable media queries for windows phone 8 -->
    <meta name="format-detection" content="telephone=no" />
    <!-- disable auto telephone linking in iOS -->
    <title>Email</title>
    <style type="text/css">
        body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        }
    </style>
    </head>

    <body style="margin: 0; padding: 0" bgcolor="#E5E5E5">
    <!-- 100% background wrapper (grey background) -->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
        style="max-width: 21cm; margin: 10px auto; padding: 45px 35px">
        <!-- logo section -->
        <tr>
        <td>
            <img src="https://onesign-bucket.s3.amazonaws.com/1sign-logo.png" alt="" width="115px"
            style="margin-bottom: 35px" />
        </td>
        </tr>
        <!-- signer statement -->
        <tr>
        <td>
            <p style="
                font-size: 13px;
                line-height: 20px;
                color: #111635;
                margin: 0;
                ">
            This document is signed using <b>1:Sign</b> and <b>1:ID</b>. Time of
            signing, the signers’ identities and the IP-addresses they have
            signed from have been registered as detailed below:
            </p>
            <p style="
                font-size: 13px;
                line-height: 20px;
                color: #111635;
                margin: 20px 0 0 0;
                ">
            With my <b>1:<span style="color: #1170c9">ID</span></b> signatures,
            I accept the content of this document.
            </p>
        </td>
        </tr>

        <tr>
        <td style="padding: 15px 0">
    `;

  r += createSignTable(signers);

  r += `
        </td>
        </tr>

        <!-- bottom -->
        <tr>
        <td>
            <p style="
                font-size: 13px;
                line-height: 20px;
                color: #111635;
                margin: 0 0 50px 0;
                ">
            This pdf-document contains a digital certificate issued by 1Sign
            (CVR 39694050). The signatures of this document can be validated
            using the mathematical hash values of the original documents. The
            document has been time stamped and locked for further changes and
            encrypted signing certificates are attached to this pdf-file
            enabling future validation.
            </p>
        </td>
        </tr>
    </table>
    <!--/100% background wrapper-->
    </body>

    </html>
    `;

  return r;
};

const createSignTable = (signers) => {
  let r = `
    <table border="0" width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0">
        <tr>`;

  for (let i = 0; i < signers.length; i++) {
    if (i % 2 == 0) {
      r += `
        </tr>
    </table>
    <table border="0" width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0">
        <tr>
            `;
    }

    r += createSignCard(signers[i]);
  }

  r += `
        </tr>
    </table>
  `;

  return r;
};

const createSignCard = (signer) => {
  const profileImage =
    "https://onesign-bucket.s3.us-west-2.amazonaws.com/user.png";

  const qrCode = "https://onesign-bucket.s3.us-west-2.amazonaws.com/qr.png";

  const name = "dummy name";

  const role = "designation";

  const date = 2020 - 06 - 12;

  return `
    <td>
        <div style="
            background-color: #fff;
            box-shadow: 0px 13px 94px rgba(124, 139, 160, 0.14);
            border-radius: 5px;
            padding: 15px;
            margin-right: 10px;
            width: 9cm;
            ">
        <table border="0" width="100%" cellpadding="0" cellspacing="0">
            <tr>
            <td style="width: 60%;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 14px">
                ${name}
                </h3>
                <p style="color: #374151; font-size: 12px; margin: 0 0 5px 0">
                <b>Role:</b> ${role}
                </p>
                <p style="color: #374151; font-size: 12px; margin: 0 0 5px 0">
                <b>For:</b> ${signer?.company || "Webfixerr"}
                </p>
                <p style="color: #374151; font-size: 12px; margin: 0 0 5px 0">
                <b>IP Address:</b> ${signer?.ip || "103.240.245.18"}
                </p>
                <p style="color: #374151; font-size: 12px; margin: 0">
                <b>Date: </b>${date}
                </p>
            </td>
            <td style="text-align: right;">
                <img
                src="${profileImage}"
                alt="" width="64px" height="64px" style="object-fit: cover; margin-bottom: 25px;" />
                <img src="${qrCode}" alt="" width="64px"
                style="margin-bottom: 25px;" />
                <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAjCAYAAAAKTC24AAAABHNCSVQICAgIfAhkiAAAA7tJREFUaEPtmk9WGkEQxrsmCMuYE4ScIHiC4AnUG+hGYRXciArvhbyAQjaSFZiNegL1BOIN8ATiCYI7JTKVatDIn66enoTGwTezg+kHNb/5uuur6gYxcuX3a0nhwMXo96rPxWwKTMaZjMmX69x/XhW3Uxndb/iIuS1QNId+C6CBiM0u4lV5J90yiVU3ZgyIj+DERIFW6qgOFC+L2XRyQkC1vCiAJqA4jsRiJ4XNtfa/wA2BqqkRTKhGotEffsGGQDUyRBQtQFwr7qQbpmoNgRqQcl1c29tJHxsMFSFQE0o0BgVslrIbVa/hrx4oCryhh1Rmb0RIAIi3XpCe7psodQzo7vefCQe7vTdBWS8OAt5zfzgbWR6/kksocM9QODia79zdLTuOWKVE9MkDbvvBxQWdvdL6yHylRoHAl9cMdPDZ8pXDZfKkx1rVomiQL17kmIRAR8hs79fibwCaWqguLnKZPwSqkJpc9sB1GxxUslPnpe3UskqlIVBm7uYqhxkQeMBN7Ug09k5l+q0C7b1pxI8OQOvb1vqltny0Vnrqk5Iuplyl1uKSMpfxrQCVmfOhc39EwT5PC1rMqUZe4Uq5fACBUsOmSk79swo62bGTUjZNzmD4sgJUE8gZWa0VVYCBBEpZn8zjqRqoaJayqYXpAGXVJgS39gQR6ONM++XHNk5coV5BCMZyBBGoBMnHpRbHxIHKIHLlepuzHFx1NYtAVeKwA5S1HHzGDYGSEnW1vPRxArHwrFS9fZlFoFTXfxit660odHARl6WcyV5NEIF6bQepBGUdqEf35u/tQALVNIdkW5B8aHwqtskU4nCnx9Ym3X9USuX6NS1ZY9Bk3Fw9HyqUefu7+7VVxwFZ7SmvqZaes67QfpPdlecE5pVVEorbuVgsPvXmiB+wQVlDe/1QB05p6ia4+Lk6Xo4Pp/wAtcdpLlt2SmU+DVXZpad7VoFSxbQEAAnam2rNRaPnukMDL6VQqcgIwBLFmOES0LBS9UnOClBZz//u3F8MTht5zKXr4grnSa0BpbahoPNLz1AwQbuPfQVCb1pr1TgEE4U8Z8UuBdamPMGRLa/xLQLNBpc1oH4Wct1Ygkn93KTX0RwrCvXboZHPEWighjCtKLS3Jjlwzfo3cBb2ttaHjxQGGKg08GSRVr2UaTUpce07Cu6WdguVa1bQFNo/ceJkitmNMz+rhqUpr9460J0PCgxQmt4uYtX0cNgobCtA+2uihOrSyWN5vAVpx9Op6t72ywHFS2nrKD5yIe6ZSWdMp9g/cup4UYRm+7YAAAAASUVORK5CYII="
                alt="" height="24px" style="" />
                <img
                src="https://media.istockphoto.com/vectors/approval-symbol-check-mark-in-a-circle-drawn-by-hand-vector-green-ok-vector-id1094780808?b=1&k=20&m=1094780808&s=170667a&w=0&h=stB0rAfwOPwAOTM4iO2YP02Dh8ZsfhqYR_Eu4zCv06s="
                alt="" height="24px" style="" />
            </td>
            </tr>
        </table>
        </div>
    </td>
    `;
};

function convertPdfHtml(originalFile, userData, docId) {
  return new Promise(async (resolve, reject) => {
    const HtmlContent = createSignPage(userData);

    try {
      pdf.create(HtmlContent).toFile("html-created.pdf", (err, res) => {
        if (err) {
          console.log(err);
        }
        console.log(res);
      });
      pdf.create(HtmlContent).toBuffer((err, pdfBuffer) => {
        console.log(pdfBuffer);
        const buffers = pdfBuffer.toString("base64");

        mergePdfFiles(originalFile, buffers, docId)
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            resolve({ status: false, result: null });
          });
      });
    } catch (error) {
      console.log(error);
      reject({ status: false, result: null });
    }
  });
}

function mergePdfFiles(buffer1, buffer2, docId) {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfBuffer1 = buffer1;
      const pdfBuffer2 = buffer2;

      const pdfsToMerge = [pdfBuffer1, pdfBuffer2];

      const mergedPdf = await PDFDocument.create();
      for (const pdfBytes of pdfsToMerge) {
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          const { width, height } = page.getSize();

          //Draw a string of text diagonally across the first page
          page.drawText(
            `1SIGN Document Key:  1SIGN-${docId?.match(/.{1,6}/g)?.join("-")}`,
            {
              x: width - 10,
              y: height / 2 - 100,
              size: 10,
              color: rgb(0.066, 0.32, 0.592),
              rotate: degrees(90),
            }
          );
        });
      }

      const buf = await mergedPdf.save();
      fs.writeFileSync("merged.pdf", buf);
      resolve(buf);
    } catch (err) {
      reject(err);
    }
  });
}

//driver fn
let file = fs.readFileSync("sample.pdf");
convertPdfHtml(file, [{}, {}, {}, {}], "61d587cd29cd70b8ad55ebac");
