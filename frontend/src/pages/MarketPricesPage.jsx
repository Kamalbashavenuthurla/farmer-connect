import { useState, useEffect } from 'react'
import api from '../utils/api'
import { TrendingUp, Search } from 'lucide-react'

export default function MarketPricesPage() {
  const [prices, setPrices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/market-prices/').then(r => setPrices(r.data.prices)).finally(() => setLoading(false)) }, [])

  const filtered = prices.filter(p => p.crop_name.toLowerCase().includes(search.toLowerCase()) || p.district?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={28} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">Market Prices</h1>
          <p className="text-gray-500 text-sm">Today's commodity prices from APMC markets</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search crop or district..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading prices...</div> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Crop</th>
                <th className="px-4 py-3 text-right">Price (₹)</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">Market</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{p.crop_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">₹{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.market_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.district}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{p.price_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
