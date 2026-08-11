with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'r') as f:
    c = f.read()
c = c.replace("w-full max-w-sm mr-4 mt-4", "w-[340px] mx-auto mt-4")
c = c.replace("}, { duration: 4000 });", "}, { duration: 4000, position: 'top-center' as any });")
with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'w') as f:
    f.write(c)
