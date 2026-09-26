const fs = require('fs');
let code = fs.readFileSync('client/src/pages/SwapGuru.tsx', 'utf8');

const s1 = `  const [messages, setMessages] = useState<Array<{ role: "user" | "guru"; content: string; listings?: any[] }>>([]);`;
const r1 = `  const [messages, setMessages] = useState<Array<{ role: "user" | "guru"; content: string; listings?: any[]; actions?: any[] }>>([]);`;
code = code.replace(s1, r1);

const s2 = `      const result = await askMutation.mutateAsync({ prompt });
      setMessages(prev => [...prev, { role: "guru" as const, content: String(result.response), listings: result.listings as any[] }]);`;
const r2 = `      const result = await askMutation.mutateAsync({ prompt });
      setMessages(prev => [...prev, { role: "guru" as const, content: String(result.response), listings: result.listings as any[], actions: result.actions as any[] }]);`;
code = code.replace(s2, r2);

const handleActionFunc = `
  const handleGuruAction = (act: any) => {
      if (act.actionType === 'NAVIGATE') {
          navigate(act.payload);
      } else if (act.actionType === 'PROPOSE_SWAP') {
          // You could automatically open the propose modal, but for now we just show a toast or navigate
          toast.success("Ready to propose swap with top-up KES " + (act.payload.cashTopUp || 0));
          navigate('/swipes');
      }
  };
`;

const s3 = `  const getGreeting = useCallback(() => {`;
code = code.replace(s3, handleActionFunc + "\n" + s3);

const s4 = `          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}`;
const r4 = `          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} onAction={handleGuruAction} />
          ))}`;
code = code.replace(s4, r4);

fs.writeFileSync('client/src/pages/SwapGuru.tsx', code);
console.log("Done");
