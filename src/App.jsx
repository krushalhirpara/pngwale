import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import ImageDetailPage from './pages/ImageDetailPage'
import StaticPage from './pages/StaticPage'
import AdminUpload from './pages/AdminUpload'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ProtectedRoute from './components/Admin/ProtectedRoute'
import { Toaster } from 'react-hot-toast'


const pageText = {
  about: `Welcome to PNGWALE – your simple and reliable source for high-quality PNG images and vector resources.

At PNGWALE, our goal is to make it easy for designers, content creators, students, and businesses to find transparent PNG images, design elements, and vector resources that can be used in creative projects.

We understand that finding the right design element can take time. That is why PNGWALE focuses on providing clean, well-organized, and easy-to-download graphics that save your time and help you create better designs.

Our Mission

Our mission is to create a platform where anyone can quickly access useful design resources without complicated processes. We want to help creators focus more on creativity and less on searching for assets.

Our Vision

PNGWALE aims to grow into a trusted platform for design resources, PNG images, and creative assets used by creators around the world.

Thank you for visiting PNGWALE and supporting our platform.`,

  privacy: `At PNGWALE, accessible from our website, protecting the privacy of our visitors is one of our main priorities. This Privacy Policy document explains what type of information we collect and how we use, store, and protect it.

By using our website, you agree to the practices described in this Privacy Policy.

Information We Collect

When you visit PNGWALE, we may automatically collect certain non-personal information, such as:

• Internet Protocol (IP) address
• Browser type and version
• Device information
• Internet Service Provider (ISP)
• Date and time of your visit
• Pages visited on our website
• Referring or exit pages

This information helps us understand how visitors interact with our website so that we can improve our content, design, and user experience.

We do not collect sensitive personal information such as passwords, financial data, or private identification details.

Cookies and Web Beacons

PNGWALE uses cookies to store small pieces of information on your device. Cookies help our website:

• Remember user preferences
• Improve website speed and performance
• Understand visitor behavior
• Deliver relevant content and advertisements

Users can choose to disable cookies through their browser settings. However, disabling cookies may affect some features of the website.

Google AdSense and Advertising Partners

PNGWALE may display advertisements from third-party advertising networks such as Google AdSense.

Google may use technologies like cookies and web beacons to show ads based on users' previous visits to this or other websites. This helps provide more relevant advertisements.

Google uses the DoubleClick cookie, which allows it to serve ads to users based on their browsing behavior.

Users can opt out of personalized advertising by visiting Google Ads Settings.

Third-Party Privacy Policies

Our Privacy Policy applies only to our website. Other websites or advertising partners may have different privacy policies.

We recommend that users review the Privacy Policies of third-party services for more detailed information about their practices and instructions on how to opt out of certain options.

Data Protection

We take reasonable steps to protect the information collected on our website. However, no method of internet transmission or electronic storage is completely secure.

While we strive to protect user data, we cannot guarantee absolute security.

Children's Information

Protecting children's privacy online is important to us. PNGWALE does not knowingly collect personal information from children under the age of 13.

If you believe that a child has provided personal information on our website, please contact us and we will remove such information immediately.

User Consent

By using PNGWALE, you consent to our Privacy Policy and agree to its terms.

Updates to This Policy

PNGWALE may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.`,

  terms: `Welcome to PNGWALE.

These Terms and Conditions outline the rules and guidelines for using our website and its resources. By accessing and using PNGWALE, you agree to comply with these terms.

If you do not agree with any part of these terms, please discontinue the use of our website.

Use of Website

PNGWALE provides PNG images, vector resources, and design elements that can be used for various creative purposes.

Users may browse, download, and use resources from the website according to the licensing rules mentioned on our License page.

The website is intended for individuals, designers, content creators, and businesses looking for digital design assets.

Intellectual Property Rights

All content on PNGWALE, including images, graphics, logos, text, and website design, is protected by intellectual property laws.

Some resources may be created by our team, while others may be edited, curated, or modified digital assets.

Users are allowed to download resources for personal or permitted commercial use, but they must respect the licensing restrictions.

Restrictions on Use

Users are strictly prohibited from:

• Re-uploading PNGWALE resources to other resource websites
• Selling the original files as standalone products
• Claiming PNGWALE resources as their own work
• Copying large portions of website content without permission

Violation of these rules may result in legal action or permanent restriction from accessing the website.

Website Availability

While we try to keep PNGWALE accessible at all times, we cannot guarantee uninterrupted availability.

The website may occasionally experience technical issues, maintenance periods, or updates that temporarily limit access.

External Links

Our website may include links to third-party websites for additional resources or information.

PNGWALE does not control these external websites and is not responsible for their content, policies, or practices.

Users should review the policies of those websites before using them.

Limitation of Liability

PNGWALE will not be responsible for any loss, damage, or issues resulting from the use of our website or its resources.

Users are responsible for ensuring that downloaded resources are used appropriately in their projects.

Updates to Terms

We reserve the right to update or modify these Terms and Conditions at any time.

Continued use of the website after changes means that you accept the updated terms.`,

  disclaimer: `The information and digital resources available on PNGWALE are provided for general informational and creative use.

While we try to ensure that the content on this website is accurate and useful, we make no guarantees regarding the completeness, reliability, or accuracy of the information provided.

Use of Website Content

All actions taken based on the information or resources found on PNGWALE are strictly at the user's own risk.

PNGWALE will not be responsible for any losses, damages, or issues that may occur from using the content available on the website.

Design Resources

The PNG images and design elements provided on PNGWALE are intended to help designers, students, and content creators in their projects.

Some graphics may be original creations, while others may be edited or curated design elements.

If any content unintentionally violates copyright or ownership rights, users can contact us to request removal.

External Links Disclaimer

Our website may contain links to external websites or third-party resources.

These links are provided for convenience and informational purposes only. PNGWALE does not control or guarantee the accuracy of the content on those external websites.

Advertisement Disclaimer

PNGWALE may display advertisements through advertising networks such as Google AdSense.

We do not control the advertisements shown and are not responsible for the content or claims made in those advertisements.

Professional Advice Disclaimer

The content on this website should not be considered professional, legal, or financial advice. Users should seek professional guidance if necessary.

Consent

By using PNGWALE, you agree to this disclaimer and its terms.`,

  dmca: `PNGWALE respects the intellectual property rights of others and expects users to do the same.

If you believe that any content on our website violates your copyright, you may submit a DMCA takedown request.

How to Submit a Copyright Complaint

To request removal of copyrighted material, please send us the following information:

• Your full name and contact information
• The URL of the content that you believe violates copyright
• Proof that you are the copyright owner or authorized representative
• A statement that the information provided is accurate

Once we receive a valid request, we will review the complaint and remove the content if necessary.

Content Removal

After verifying the complaint, the content may be removed from PNGWALE within a reasonable period of time.

False Claims

Submitting false copyright claims may result in legal consequences. Please ensure that the information you provide is accurate.

Contact

You can submit DMCA requests through our Contact Us page.`,

  license: `This License Agreement explains how the images and resources available on PNGWALE can be used.

By downloading or using any resource from PNGWALE, you agree to follow the terms mentioned on this page.

Free Usage

Most resources on PNGWALE are provided for personal and educational use. You may use them in projects such as:

• School or college projects
• Personal designs
• Social media posts
• Presentations

Commercial Use

Some resources may also be used for commercial purposes, such as:

• YouTube videos
• Website design
• Digital marketing graphics
• Client design projects

However, users must make sure that the resource is not redistributed as a standalone file.

Not Allowed

The following actions are not allowed:

• Re-uploading PNGWALE images on another resource website
• Selling the images as your own files
• Redistributing the original files without modification
• Claiming the resources as your own creation

Copyright Notice

Some images on PNGWALE may be created by our team, while others may be modified or curated design resources. If you believe that any content on our website violates copyright laws, please contact us immediately.

We will review the request and remove the content if necessary.

Attribution

Attribution is not required for most downloads, but giving credit to PNGWALE is always appreciated.

Example credit:

"Image by PNGWALE"

Changes to License

PNGWALE reserves the right to update or change the license terms at any time without prior notice.

Contact

For license or copyright related questions, please contact us through the Contact Us page on our website.`,
}

const galleryPathRegex = /^\/$|^\/(vector|clipart|festival|flower|shape)$/

function App() {
  const location = useLocation()
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isHomeGradientPage = useMemo(
    () => galleryPathRegex.test(location.pathname),
    [location.pathname],
  )

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {!location.pathname.startsWith('/admin') && (
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          transparentOnTop={isHomeGradientPage}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />

      <main className={`mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 ${isHomeGradientPage ? 'pt-0' : 'pt-6 md:pt-8'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<StaticPage title="About Us" body={pageText.about} />} />
          <Route
            path="/privacy-policy"
            element={<StaticPage title="Privacy Policy" body={pageText.privacy} />}
          />
          <Route
            path="/terms-conditions"
            element={<StaticPage title="Terms & Conditions" body={pageText.terms} />}
          />
          <Route path="/disclaimer" element={<StaticPage title="Disclaimer" body={pageText.disclaimer} />} />
          <Route path="/dmca" element={<StaticPage title="DMCA" body={pageText.dmca} />} />
          <Route path="/license" element={<StaticPage title="License Page" body={pageText.license} />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/image/:itemId" element={<ImageDetailPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/upload" element={
            <ProtectedRoute>
              <AdminUpload />
            </ProtectedRoute>
          } />

          <Route path="/:categorySlug" element={<HomePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!location.pathname.startsWith('/admin') && (
        <Footer theme={theme} />
      )}
    </div>
  )
}

export default App
