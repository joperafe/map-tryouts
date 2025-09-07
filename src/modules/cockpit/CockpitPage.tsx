
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CockpitPage() {
  const { t } = useTranslation()
  const [carFree, setCarFree] = useState(false)
  const [smartLights, setSmartLights] = useState(false)

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('COCKPIT')}</h1>
      <div className="grid gap-4">
        <div className="p-4 rounded-2xl shadow bg-white flex items-center justify-between">
          <div>
            <div className="font-semibold">{t('ACTIONS_SIMULATE_CAR_FREE')}</div>
            <div className="text-sm text-gray-500">Mock action toggle for a selected corridor</div>
          </div>
          <button
            className={'px-3 py-2 rounded border ' + (carFree ? 'bg-green-100' : 'bg-white')}
            onClick={() => setCarFree(v => !v)}
          >
            {carFree ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="p-4 rounded-2xl shadow bg-white flex items-center justify-between">
          <div>
            <div className="font-semibold">{t('ACTIONS_TOGGLE_SMART_LIGHTS')}</div>
            <div className="text-sm text-gray-500">Mock control for adaptive lighting</div>
          </div>
          <button
            className={'px-3 py-2 rounded border ' + (smartLights ? 'bg-green-100' : 'bg-white')}
            onClick={() => setSmartLights(v => !v)}
          >
            {smartLights ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  )
}
