import type { Page } from '../types';
import '../styles/sidebar.css';

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
}

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'simulasi', icon: '◈', label: 'Farm Blocks' },
  { id: 'laporan', icon: '📄', label: 'Impact Reports' },
];

export default function Sidebar({ page, setPage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">🌾</div>
          <span className="sidebar-logo-name">Astungkara</span>
        </div>
        <div className="sidebar-logo-sub">Field Guide</div>
      </div>

      <div className="sidebar-section">
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">AW</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Farmer Dashboard</div>
            <div className="sidebar-user-role">Integrated System v1.2.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}