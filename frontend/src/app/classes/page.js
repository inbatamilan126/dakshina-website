// File: frontend/src/app/classes/page.js
'use client'; // This is now an interactive page because of the form

import { useState, useEffect } from 'react';
import Image from 'next/image';

// This is our main Classes page component.
export default function ClassesPage() {
  // State for the page's descriptive content
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91', // Default to India
    phone: '', 
    message: '',
  });
  const [status, setStatus] = useState('');
  
  const strapiUrl = 'http://localhost:1337';

  // Fetch the page content when the component mounts
  useEffect(() => {
    async function getClassesPageContent() {
      try {
        const res = await fetch('http://localhost:1337/api/classes-page?populate=*');
        if (!res.ok) throw new Error('Failed to fetch data');
        const responseData = await res.json();
        setPageData(responseData.data);
      } catch (error) {
        console.error("Error fetching classes page content:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getClassesPageContent();
  }, []); // Empty array ensures this runs only once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');
    console.log('Class Inquiry Submitted:', {
        ...formData,
        fullPhoneNumber: `${formData.countryCode}${formData.phone}`
    });
    setTimeout(() => {
      setStatus('Inquiry sent successfully! We will get in touch with you soon.');
      setFormData({ name: '', email: '', countryCode: '+91', phone: '', message: '' });
    }, 1000);
  };
  
  // --- UPDATED: Comprehensive list of country codes ---
  const countryCodes = [
      { name: 'India', code: '+91' },
      { name: 'United States', code: '+1' },
      { name: 'United Kingdom', code: '+44' },
      { name: 'Australia', code: '+61' },
      { name: 'Afghanistan', code: '+93' },
      { name: 'Albania', code: '+355' },
      { name: 'Algeria', code: '+213' },
      { name: 'American Samoa', code: '+1-684' },
      { name: 'Andorra', code: '+376' },
      { name: 'Angola', code: '+244' },
      { name: 'Anguilla', code: '+1-264' },
      { name: 'Antarctica', code: '+672' },
      { name: 'Antigua and Barbuda', code: '+1-268' },
      { name: 'Argentina', code: '+54' },
      { name: 'Armenia', code: '+374' },
      { name: 'Aruba', code: '+297' },
      { name: 'Austria', code: '+43' },
      { name: 'Azerbaijan', code: '+994' },
      { name: 'Bahamas', code: '+1-242' },
      { name: 'Bahrain', code: '+973' },
      { name: 'Bangladesh', code: '+880' },
      { name: 'Barbados', code: '+1-246' },
      { name: 'Belarus', code: '+375' },
      { name: 'Belgium', code: '+32' },
      { name: 'Belize', code: '+501' },
      { name: 'Benin', code: '+229' },
      { name: 'Bermuda', code: '+1-441' },
      { name: 'Bhutan', code: '+975' },
      { name: 'Bolivia', code: '+591' },
      { name: 'Bosnia and Herzegovina', code: '+387' },
      { name: 'Botswana', code: '+267' },
      { name: 'Brazil', code: '+55' },
      { name: 'British Indian Ocean Territory', code: '+246' },
      { name: 'British Virgin Islands', code: '+1-284' },
      { name: 'Brunei', code: '+673' },
      { name: 'Bulgaria', code: '+359' },
      { name: 'Burkina Faso', code: '+226' },
      { name: 'Burundi', code: '+257' },
      { name: 'Cambodia', code: '+855' },
      { name: 'Cameroon', code: '+237' },
      { name: 'Canada', code: '+1' },
      { name: 'Cape Verde', code: '+238' },
      { name: 'Cayman Islands', code: '+1-345' },
      { name: 'Central African Republic', code: '+236' },
      { name: 'Chad', code: '+235' },
      { name: 'Chile', code: '+56' },
      { name: 'China', code: '+86' },
      { name: 'Christmas Island', code: '+61' },
      { name: 'Cocos Islands', code: '+61' },
      { name: 'Colombia', code: '+57' },
      { name: 'Comoros', code: '+269' },
      { name: 'Cook Islands', code: '+682' },
      { name: 'Costa Rica', code: '+506' },
      { name: 'Croatia', code: '+385' },
      { name: 'Cuba', code: '+53' },
      { name: 'Curacao', code: '+599' },
      { name: 'Cyprus', code: '+357' },
      { name: 'Czech Republic', code: '+420' },
      { name: 'Democratic Republic of the Congo', code: '+243' },
      { name: 'Denmark', code: '+45' },
      { name: 'Djibouti', code: '+253' },
      { name: 'Dominica', code: '+1-767' },
      { name: 'Dominican Republic', code: '+1-809, +1-829, +1-849' },
      { name: 'East Timor', code: '+670' },
      { name: 'Ecuador', code: '+593' },
      { name: 'Egypt', code: '+20' },
      { name: 'El Salvador', code: '+503' },
      { name: 'Equatorial Guinea', code: '+240' },
      { name: 'Eritrea', code: '+291' },
      { name: 'Estonia', code: '+372' },
      { name: 'Ethiopia', code: '+251' },
      { name: 'Falkland Islands', code: '+500' },
      { name: 'Faroe Islands', code: '+298' },
      { name: 'Fiji', code: '+679' },
      { name: 'Finland', code: '+358' },
      { name: 'France', code: '+33' },
      { name: 'French Polynesia', code: '+689' },
      { name: 'Gabon', code: '+241' },
      { name: 'Gambia', code: '+220' },
      { name: 'Georgia', code: '+995' },
      { name: 'Germany', code: '+49' },
      { name: 'Ghana', code: '+233' },
      { name: 'Gibraltar', code: '+350' },
      { name: 'Greece', code: '+30' },
      { name: 'Greenland', code: '+299' },
      { name: 'Grenada', code: '+1-473' },
      { name: 'Guam', code: '+1-671' },
      { name: 'Guatemala', code: '+502' },
      { name: 'Guernsey', code: '+44-1481' },
      { name: 'Guinea', code: '+224' },
      { name: 'Guinea-Bissau', code: '+245' },
      { name: 'Guyana', code: '+592' },
      { name: 'Haiti', code: '+509' },
      { name: 'Honduras', code: '+504' },
      { name: 'Hong Kong', code: '+852' },
      { name: 'Hungary', code: '+36' },
      { name: 'Iceland', code: '+354' },
      { name: 'Indonesia', code: '+62' },
      { name: 'Iran', code: '+98' },
      { name: 'Iraq', code: '+964' },
      { name: 'Ireland', code: '+353' },
      { name: 'Isle of Man', code: '+44-1624' },
      { name: 'Israel', code: '+972' },
      { name: 'Italy', code: '+39' },
      { name: 'Ivory Coast', code: '+225' },
      { name: 'Jamaica', code: '+1-876' },
      { name: 'Japan', code: '+81' },
      { name: 'Jersey', code: '+44-1534' },
      { name: 'Jordan', code: '+962' },
      { name: 'Kazakhstan', code: '+7' },
      { name: 'Kenya', code: '+254' },
      { name: 'Kiribati', code: '+686' },
      { name: 'Kosovo', code: '+383' },
      { name: 'Kuwait', code: '+965' },
      { name: 'Kyrgyzstan', code: '+996' },
      { name: 'Laos', code: '+856' },
      { name: 'Latvia', code: '+371' },
      { name: 'Lebanon', code: '+961' },
      { name: 'Lesotho', code: '+266' },
      { name: 'Liberia', code: '+231' },
      { name: 'Libya', code: '+218' },
      { name: 'Liechtenstein', code: '+423' },
      { name: 'Lithuania', code: '+370' },
      { name: 'Luxembourg', code: '+352' },
      { name: 'Macau', code: '+853' },
      { name: 'Macedonia', code: '+389' },
      { name: 'Madagascar', code: '+261' },
      { name: 'Malawi', code: '+265' },
      { name: 'Malaysia', code: '+60' },
      { name: 'Maldives', code: '+960' },
      { name: 'Mali', code: '+223' },
      { name: 'Malta', code: '+356' },
      { name: 'Marshall Islands', code: '+692' },
      { name: 'Mauritania', code: '+222' },
      { name: 'Mauritius', code: '+230' },
      { name: 'Mayotte', code: '+262' },
      { name: 'Mexico', code: '+52' },
      { name: 'Micronesia', code: '+691' },
      { name: 'Moldova', code: '+373' },
      { name: 'Monaco', code: '+377' },
      { name: 'Mongolia', code: '+976' },
      { name: 'Montenegro', code: '+382' },
      { name: 'Montserrat', code: '+1-664' },
      { name: 'Morocco', code: '+212' },
      { name: 'Mozambique', code: '+258' },
      { name: 'Myanmar', code: '+95' },
      { name: 'Namibia', code: '+264' },
      { name: 'Nauru', code: '+674' },
      { name: 'Nepal', code: '+977' },
      { name: 'Netherlands', code: '+31' },
      { name: 'New Caledonia', code: '+687' },
      { name: 'New Zealand', code: '+64' },
      { name: 'Nicaragua', code: '+505' },
      { name: 'Niger', code: '+227' },
      { name: 'Nigeria', code: '+234' },
      { name: 'Niue', code: '+683' },
      { name: 'North Korea', code: '+850' },
      { name: 'Northern Mariana Islands', code: '+1-670' },
      { name: 'Norway', code: '+47' },
      { name: 'Oman', code: '+968' },
      { name: 'Pakistan', code: '+92' },
      { name: 'Palau', code: '+680' },
      { name: 'Palestine', code: '+970' },
      { name: 'Panama', code: '+507' },
      { name: 'Papua New Guinea', code: '+675' },
      { name: 'Paraguay', code: '+595' },
      { name: 'Peru', code: '+51' },
      { name: 'Philippines', code: '+63' },
      { name: 'Pitcairn', code: '+64' },
      { name: 'Poland', code: '+48' },
      { name: 'Portugal', code: '+351' },
      { name: 'Puerto Rico', code: '+1-787, +1-939' },
      { name: 'Qatar', code: '+974' },
      { name: 'Republic of the Congo', code: '+242' },
      { name: 'Reunion', code: '+262' },
      { name: 'Romania', code: '+40' },
      { name: 'Russia', code: '+7' },
      { name: 'Rwanda', code: '+250' },
      { name: 'Saint Barthelemy', code: '+590' },
      { name: 'Saint Helena', code: '+290' },
      { name: 'Saint Kitts and Nevis', code: '+1-869' },
      { name: 'Saint Lucia', code: '+1-758' },
      { name: 'Saint Martin', code: '+590' },
      { name: 'Saint Pierre and Miquelon', code: '+508' },
      { name: 'Saint Vincent and the Grenadines', code: '+1-784' },
      { name: 'Samoa', code: '+685' },
      { name: 'San Marino', code: '+378' },
      { name: 'Sao Tome and Principe', code: '+239' },
      { name: 'Saudi Arabia', code: '+966' },
      { name: 'Senegal', code: '+221' },
      { name: 'Serbia', code: '+381' },
      { name: 'Seychelles', code: '+248' },
      { name: 'Sierra Leone', code: '+232' },
      { name: 'Singapore', code: '+65' },
      { name: 'Sint Maarten', code: '+1-721' },
      { name: 'Slovakia', code: '+421' },
      { name: 'Slovenia', code: '+386' },
      { name: 'Solomon Islands', code: '+677' },
      { name: 'Somalia', code: '+252' },
      { name: 'South Africa', code: '+27' },
      { name: 'South Korea', code: '+82' },
      { name: 'South Sudan', code: '+211' },
      { name: 'Spain', code: '+34' },
      { name: 'Sri Lanka', code: '+94' },
      { name: 'Sudan', code: '+249' },
      { name: 'Suriname', code: '+597' },
      { name: 'Svalbard and Jan Mayen', code: '+47' },
      { name: 'Swaziland', code: '+268' },
      { name: 'Sweden', code: '+46' },
      { name: 'Switzerland', code: '+41' },
      { name: 'Syria', code: '+963' },
      { name: 'Taiwan', code: '+886' },
      { name: 'Tajikistan', code: '+992' },
      { name: 'Tanzania', code: '+255' },
      { name: 'Thailand', code: '+66' },
      { name: 'Togo', code: '+228' },
      { name: 'Tokelau', code: '+690' },
      { name: 'Tonga', code: '+676' },
      { name: 'Trinidad and Tobago', code: '+1-868' },
      { name: 'Tunisia', code: '+216' },
      { name: 'Turkey', code: '+90' },
      { name: 'Turkmenistan', code: '+993' },
      { name: 'Turks and Caicos Islands', code: '+1-649' },
      { name: 'Tuvalu', code: '+688' },
      { name: 'U.S. Virgin Islands', code: '+1-340' },
      { name: 'Uganda', code: '+256' },
      { name: 'Ukraine', code: '+380' },
      { name: 'United Arab Emirates', code: '+971' },
      { name: 'Uruguay', code: '+598' },
      { name: 'Uzbekistan', code: '+998' },
      { name: 'Vanuatu', code: '+678' },
      { name: 'Vatican', code: '+379' },
      { name: 'Venezuela', code: '+58' },
      { name: 'Vietnam', code: '+84' },
      { name: 'Wallis and Futuna', code: '+681' },
      { name: 'Western Sahara', code: '+212' },
      { name: 'Yemen', code: '+967' },
      { name: 'Zambia', code: '+260' },
      { name: 'Zimbabwe', code: '+263' },
  ];

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><h1 className="text-4xl">Loading...</h1></main>;
  }

  if (!pageData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-4xl">Could not load page content.</h1>
      </main>
    );
  }

  const { title, description, image } = pageData;
  const imageUrl = strapiUrl + image.url;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Banner Image */}
      <div className="relative w-full h-80">
        <Image src={imageUrl} alt={title || 'A dancer in motion'} fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-6xl font-serif font-bold text-center">{title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-8 md:p-16">
        <div className="prose prose-invert lg:prose-xl max-w-none text-lg text-gray-300 mb-12">
          {description.map((block, index) => (
            <p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>
          ))}
        </div>
        
        {/* --- Inquiry Form --- */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-6">Inquire About Classes</h2>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500" />
            </div>
            {/* --- UPDATED: Phone Number Field --- */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="flex">
                <select 
                  name="countryCode" 
                  value={formData.countryCode} 
                  onChange={handleChange}
                  className="bg-gray-700 text-white p-3 rounded-l-lg border border-r-0 border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.code}>{country.name} ({country.code})</option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  name="phone" 
                  id="phone" 
                  required // Now mandatory
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full bg-gray-700 text-white p-3 rounded-r-lg border border-gray-600 focus:ring-2 focus:ring-green-500" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Your Message or Question</label>
              <textarea name="message" id="message" required rows="5" value={formData.message} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500"></textarea>
            </div>
            <div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700 disabled:bg-gray-500" disabled={status === 'Sending...'}>
                {status === 'Sending...' ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
            {status && status !== 'Sending...' && (
              <p className="text-center text-green-400">{status}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
