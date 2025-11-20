// MainContent.jsx - Updated
import BrandTab from './Brand';
import MixTab from './MixTab';
import DetailsTab from './DetailsTab';
import AdminDashboard from './AdminDashboard';
import PaintCalculator from './PaintCalculator';
import { useAdmin } from '../context/AdminContext';

export default function MainContent({ activeTab, setActiveTab }) {
  const { isAdmin } = useAdmin();

  const renderContent = () => {
    switch (activeTab) {
      case 'brand':
        return <BrandTab setActiveTab={setActiveTab} />;
      case 'mix':
        return <MixTab />;
      case 'calculator':
        return <PaintCalculator />;
      case 'details':
        return <DetailsTab />;
      case 'admin':
        if (isAdmin) {
          return <AdminDashboard />;
        }
        // If non-admin somehow accesses admin tab, show access denied
        return (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin panel.</p>
          </div>
        );
      default:
        return <BrandTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="main-content">
      {renderContent()}
    </div>
  );
}