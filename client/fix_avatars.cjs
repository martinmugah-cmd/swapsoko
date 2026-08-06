const fs = require('fs');

// 1. Fix Home.tsx to not randomly fallback if profile is empty, or better, to just use profileQuery.data.avatarUrl primarily.
// Actually, in Home.tsx, the header avatar is rendered.
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(
    /\{\(profileQuery\.data\?\.avatarUrl \|\| user\?\.avatarUrl\) \? \([\s\S]*?<img src=\{profileQuery\.data\?\.avatarUrl \|\| user\?\.avatarUrl\} alt="Avatar" className="w-full h-full object-cover" \/>[\s\S]*?\) : \(/,
    `{(profileQuery.data?.avatarUrl) ? (
                  <img src={profileQuery.data?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (`
);
fs.writeFileSync('src/pages/Home.tsx', home);

// 2. Fix Swipes.tsx to show avatarUrl!
let swipes = fs.readFileSync('src/pages/Swipes.tsx', 'utf8');
swipes = swipes.replace(
    /<div className="w-10 h-10 rounded-full bg-\[#22C55E\] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">[\s\S]*?\{currentListing\.profiles\?\.name\?\.charAt\(0\)\.toUpperCase\(\) \|\| "U"\}[\s\S]*?<\/div>/,
    `{currentListing.profiles?.avatarUrl ? (
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
            <img src={currentListing.profiles.avatarUrl} className="w-full h-full object-cover" />
        </div>
    ) : (
        <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {currentListing.profiles?.name?.charAt(0).toUpperCase() || "U"}
        </div>
    )}`
);
fs.writeFileSync('src/pages/Swipes.tsx', swipes);

// 3. Fix Profile.tsx to consistently use avatar
let prof = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
// Fix the profile header avatar
prof = prof.replace(
    /let avatarUrl = targetProfileData\?\.avatarUrl \|\| targetProfileData\?\.user_metadata\?\.avatar_url;/,
    `let avatarUrl = targetProfileData?.avatarUrl;`
);
fs.writeFileSync('src/pages/Profile.tsx', prof);

console.log("Avatars fixed");
