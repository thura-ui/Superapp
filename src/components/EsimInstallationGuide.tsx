import { useMemo, useState } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

const installationStep1 = '/0.png';
const installationStep2 = '/1.png';
const installationStep3 = '/2.png';
const installationStep4 = '/3.png';
const installationStep5 = '/4.png';
const installationStep6 = '/5.png';
const installationStep7 = '/6.png';
const installationStep8 = '/7.png';
const installationStep9 = '/8.png';
const installationStep10 = '/9.png';
const installationStep11 = '/10.png';
const installationStep12 = '/11.png';
const installationStep13 = '/12.png';
const installationStep14 = '/13.png';
const installationStep15 = '/14.png';
const installationStep16 = '/15.png';
const installationStep17 = '/16.png';

interface EsimInstallationGuideProps {
  onBack: () => void;
}

const appleStepImages = [
  installationStep1,
  installationStep2,
  installationStep3,
  installationStep4,
  installationStep5,
  installationStep6,
  installationStep7,
  installationStep8,
  installationStep9,
  installationStep10,
  installationStep11,
  installationStep12,
  installationStep13,
  installationStep14,
  installationStep15,
  installationStep16,
  installationStep17,
];

const samsungStepImages = [
  '/samsung-installation/1.jpeg',
  '/samsung-installation/2.jpeg',
  '/samsung-installation/3.jpeg',
  '/samsung-installation/4.jpeg',
  '/samsung-installation/5.jpeg',
  '/samsung-installation/6.jpeg',
  '/samsung-installation/7.png',
  '/samsung-installation/9.jpeg',
  '/samsung-installation/10.jpeg',
];

const othersStepImages = [
  '/others-installation/1.jpg',
  '/others-installation/2.jpg',
  '/others-installation/3.jpg',
  '/others-installation/4.jpg',
  '/others-installation/5.jpg',
  '/others-installation/6.jpg',
  '/others-installation/7.png',
  '/others-installation/8.jpg',
  '/others-installation/9.jpg',
  '/others-installation/10.jpg',
  '/others-installation/11.jpg',
  '/others-installation/12.jpg',
];

const troubleshootingTips = [
  {
    title: 'No Internet Connection',
    description: 'Make sure you have a stable WiFi or mobile data connection before installing eSIM. Without internet, the eSIM installation will fail.',
  },
  {
    title: 'QR Code Not Scanning',
    description: 'Try entering the activation code manually using the "Enter Details Manually" option. Ensure good lighting and clean camera lens.',
  },
  {
    title: 'eSIM Not Activating',
    description: 'Restart your device and ensure the eSIM plan is properly installed in your Cellular settings. Wait a few minutes after installation.',
  },
  {
    title: 'Data Not Working',
    description: 'Check if Data Roaming is enabled and the correct line is selected for mobile data. Make sure cellular data is turned on.',
  },
  {
    title: 'Cannot Delete Old eSIM',
    description: 'Go to Settings > Cellular > Select the eSIM plan > Remove Cellular Plan. Confirm the deletion when prompted.',
  },
  {
    title: 'Device Not Compatible',
    description: 'Not all devices support eSIM. Check your device compatibility before purchasing. iPhone XS/XR and newer models support eSIM.',
  },
];

type DeviceType = 'apple' | 'samsung' | 'others';

export default function EsimInstallationGuide({ onBack }: EsimInstallationGuideProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('apple');

  const selectedStepImages = useMemo(() => {
    if (selectedDevice === 'samsung') {
      return samsungStepImages;
    }
    if (selectedDevice === 'others') {
      return othersStepImages;
    }
    return appleStepImages;
  }, [selectedDevice]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-6 pt-4 pb-12">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-10">Travel eSIM User Guide</h1>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedDevice('apple')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition-colors border ${selectedDevice === 'apple' ? 'text-white bg-blue-600 border-blue-600' : 'text-gray-800 bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            Apple
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('samsung')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition-colors border ${selectedDevice === 'samsung' ? 'text-white bg-blue-600 border-blue-600' : 'text-gray-800 bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            Samsung
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('others')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition-colors border ${selectedDevice === 'others' ? 'text-white bg-blue-600 border-blue-600' : 'text-gray-800 bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            Others
          </button>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-1">Important Note</div>
              <div className="text-xs text-gray-600">
                A stable internet connection is required before installing eSIM. Please connect to WiFi or use your existing mobile data.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Installation And Activation</h2>
            </div>

            <div className="space-y-6">
              {selectedStepImages.map((stepImage, index) => (
                <div key={`${selectedDevice}-step-${index + 1}`} className="flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-base font-black text-gray-900">Step {index + 1}</h3>
                  </div>
                  <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-2">
                    <img
                      src={stepImage}
                      alt={`Step ${index + 1}`}
                      className="w-full h-auto rounded-xl object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Troubleshooting</h2>
            </div>

            <div className="space-y-3">
              {troubleshootingTips.map((tip) => (
                <div key={tip.title} className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</div>
                  <div className="text-xs text-gray-600">{tip.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
          <div className="text-sm font-semibold text-gray-900 mb-2">Need More Help?</div>
          <div className="text-xs text-gray-600 mb-3">
            If you're still experiencing issues, please contact our support team.
          </div>
          <div className="text-xs text-gray-500">
            Business Cooperation: +959943229667, +959251167248. <br />
            (Mon.-Fri. 9:00 - 5:00)
          </div>
        </div>
      </div>
    </div>
  );
}
