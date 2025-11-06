import BrandTab from './Brand';
import MixTab from './MixTab';
import DetailsTab from './DetailsTab';

export default function MainContent({ activeTab, setActiveTab }) {
  return (
    <div className="main-content">
      {activeTab === 'brand' && <BrandTab setActiveTab={setActiveTab} />}
      {activeTab === 'mix' && <MixTab />}
      {activeTab === 'details' && <DetailsTab />}
    </div>
  );
}