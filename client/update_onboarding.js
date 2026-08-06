const fs = require('fs');
let code = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');

// 1. Update auto-detect effect to handle intent
const newEffect = `
  useEffect(() => {
    if (user?.email && !emailVerified && !accountType) {
      const intent = localStorage.getItem('auth_intent_type');
      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      const matchedUni = emailDomain ? UNIVERSITIES.find(u => emailDomain.endsWith(u.domain.toLowerCase())) : null;
      
      if (intent === 'student') {
        if (matchedUni) {
          setAccountType("student");
          setSelectedUniName(matchedUni.name);
          setStudentEmail(user.email);
          setEmailVerified(true);
        } else {
          toast.error("You signed in as a student but used a generic email. You will proceed as a non-student.");
          setAccountType("non-student");
        }
        localStorage.removeItem('auth_intent_type');
      } else if (intent === 'non-student') {
        setAccountType("non-student");
        localStorage.removeItem('auth_intent_type');
      } else {
        if (matchedUni) {
          setAccountType("student");
          setSelectedUniName(matchedUni.name);
          setStudentEmail(user.email);
          setEmailVerified(true);
        } else {
          setAccountType("non-student");
        }
      }
    }
  }, [user?.email, emailVerified, accountType]);
`;
code = code.replace(/\/\/ Auto-detect student domain[\s\S]*?\}, \[user\?\.email, emailVerified, accountType\]\);/, newEffect.trim());

// 2. Remove step 1, 2, 3 from switch
code = code.replace(/case 1:[\s\S]*?case 4:/, 'case 1:');
code = code.replace(/case 5:/, 'case 2:');
code = code.replace(/case 6:/, 'case 3:');

// 3. Update UI titles
code = code.replace(/Step 4<br\/>/g, 'Step 1<br/>');
code = code.replace(/Step 5<br\/>/g, 'Step 2<br/>');
code = code.replace(/Step 6<br\/>/g, 'Step 3<br/>');

// 4. Remove unused handles
code = code.replace(/const handleAccountTypeSelect =[\s\S]*?\};\n/, '');
code = code.replace(/const sendVerificationLink =[\s\S]*?\n  };\n/, '');
code = code.replace(/const simulateVerification =[\s\S]*?\n  };\n/, '');

fs.writeFileSync('src/pages/Onboarding.tsx', code);
