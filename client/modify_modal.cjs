const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// First, inject the query
const originalStart = `function SwapAgreementModal({ onClose, partnerName, listingId, isReview, initialData, onSend, onFinalize }: { onClose: () => void; partnerName: string; listingId: number; isReview?: boolean; initialData?: any; onSend: (data: any) => void; onFinalize: (data: any) => void; }) {
  const [itemsExchanged, setItemsExchanged] = useState(initialData?.itemsExchanged || "");`;

const newStart = `function SwapAgreementModal({ onClose, partnerName, listingId, isReview, initialData, onSend, onFinalize }: { onClose: () => void; partnerName: string; listingId: number; isReview?: boolean; initialData?: any; onSend: (data: any) => void; onFinalize: (data: any) => void; }) {
  const listingQuery = trpc.listings.get.useQuery({ id: listingId }, { enabled: !!listingId });
  const autoItemsExchanged = listingQuery.data?.title || initialData?.itemsExchanged || "Agreed Items";
  const [itemsExchanged, setItemsExchanged] = useState(initialData?.itemsExchanged || "");`;

code = code.replace(originalStart, newStart);

// Now, replace the textarea with the automatic visual receipt
const originalTextarea = `          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Items / Services Exchanged</label>
            <textarea
              value={itemsExchanged}
              onChange={e => setItemsExchanged(e.target.value)}
              placeholder="e.g. My Laptop for their Bike"
              rows={2}
              className="w-full bg-gray-50 border border-transparent rounded-[16px] px-4 py-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all resize-none placeholder:font-medium placeholder:text-gray-400"
            />
          </div>`;

const newVisual = `          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Item in Transaction</label>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-[16px] border border-gray-100">
               <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  {listingQuery.data?.images ? (
                     <img src={(typeof listingQuery.data.images === 'string' ? JSON.parse(listingQuery.data.images || '[]') : listingQuery.data.images)[0]} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400"><Image className="w-6 h-6" /></div>
                  )}
               </div>
               <div>
                  <h4 className="font-bold text-[#0F172A] text-sm leading-tight mb-1">{listingQuery.data?.title || autoItemsExchanged}</h4>
                  <div className="flex items-center gap-1">
                     <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">@{partnerName}</span>
                  </div>
               </div>
            </div>
            {/* Hidden itemsExchanged field to keep the rest of the code working */}
            <input type="hidden" value={autoItemsExchanged} />
          </div>`;

code = code.replace(originalTextarea, newVisual);

// In the onSend or onFinalize buttons, we need to pass autoItemsExchanged instead of itemsExchanged
// Wait, the send button does: onSend({ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes });
// Let's replace `itemsExchanged` with `autoItemsExchanged` in the onSend call inside SwapAgreementModal.

code = code.replace(/onSend\(\{ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes \}\)/g, `onSend({ itemsExchanged: autoItemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes })`);
code = code.replace(/onFinalize\(\{ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes \}\)/g, `onFinalize({ itemsExchanged: autoItemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes })`);


fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Modified modal");
