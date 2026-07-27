export type AppPage = 'tuner' | 'presets' | 'settings'

const items: Array<{ id: AppPage; label: string; icon: string }> = [
  { id: 'tuner', label: 'TUNER', icon: '⌁' },
  { id: 'presets', label: 'PRESETS', icon: '≡' },
  { id: 'settings', label: 'SETTINGS', icon: '◇' },
]

export function BottomNavigation({ page, onChange }: { page: AppPage; onChange: (page: AppPage) => void }) {
  return (
    <nav className="bottom-nav" aria-label="メインナビゲーション">
      {items.map((item) => (
        <button key={item.id} type="button" className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => onChange(item.id)}>
          <span aria-hidden="true">{item.icon}</span>{item.label}
        </button>
      ))}
    </nav>
  )
}
