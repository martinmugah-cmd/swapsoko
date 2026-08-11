import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('*');
  
  if (fetchError) {
    console.error("Error fetching profiles:", fetchError);
    return;
  }
  
  let mthreeProfile = null;
  for (let p of profiles) {
    if (p.university) {
       try {
          const u = JSON.parse(p.university);
          if (u.username === 'mthree' || u.studentEmail === 'martin.mugah@students.jkuat.ac.ke') {
             mthreeProfile = p;
             break;
          }
       } catch (e) {}
    }
  }
  
  if (mthreeProfile) {
    console.log("Found mthree:", mthreeProfile.name);
    await makeSuperAdmin(mthreeProfile);
  } else {
    console.log("mthree not found.");
  }
}

async function makeSuperAdmin(profile) {
  let university = {};
  if (profile.university) {
     try {
        university = JSON.parse(profile.university);
     } catch (e) {
        university = { name: profile.university };
     }
  }
  university.role = 'super_admin';
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ university: JSON.stringify(university) })
    .eq('user_id', profile.user_id)
    .select();
    
  if (error) {
    console.error("Failed to update profile:", error);
  } else {
    console.log("Profile updated successfully:", data);
  }
}

run();
