const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

if (!code.includes('useNotifications')) {
    code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { useNotifications } from '@/contexts/NotificationContext';");
    
    // Remove the trpc notifications query
    code = code.replace("const notificationsQuery = trpc.notifications.list.useQuery({ userId: user?.id }, { enabled: !!user });", "");
    code = code.replace("const unreadCount = (notificationsQuery.data?.notifications || []).filter((n: any) => !n.isRead).length;", "const { unreadCount } = useNotifications();");
    code = code.replace("notificationsQuery.refetch()", "");
    
    fs.writeFileSync('client/src/pages/Home.tsx', code);
    console.log("Home.tsx updated to use NotificationContext!");
}
