import assert from 'node:assert/strict';
import {createAuthController,authErrorMessage} from './dist/auth-core.mjs';

let views=[],loads=0;
const unconfigured=createAuthController({config:{firebase:null},loadSdk:()=>{loads++;},emit:v=>views.push(v)});
await unconfigured.init();await unconfigured.login('google');
assert.equal(loads,0);assert.equal(views.at(-1).configured,false);assert.match(views.at(-1).error,/Gast/);

const config={firebase:{apiKey:'test',authDomain:'test.firebaseapp.com',projectId:'test',appId:'test'},providers:{google:true,apple:true}};
let listener,calls=[],popupError=null,logoutError=null;
class Provider {constructor(id='google.com'){this.id=id;this.scopes=[];}addScope(s){this.scopes.push(s);}setCustomParameters(p){this.params=p;}}
const sdk={
 initializeApp:(c,n)=>{assert.equal(n,'athlet-auth');return {c};},
 getAuth:()=>({}),browserLocalPersistence:'local',setPersistence:async(a,p)=>assert.equal(p,'local'),
 onAuthStateChanged:(auth,cb)=>{listener=cb;cb(null);},
 GoogleAuthProvider:Provider,OAuthProvider:Provider,
 signInWithPopup:async(a,p)=>{calls.push(p);if(popupError)throw popupError;listener({uid:p.id,displayName:'Testperson',email:'test@example.com'});},
 signOut:async()=>{if(logoutError)throw logoutError;listener(null);}
};
views=[];
const auth=createAuthController({config,loadSdk:async()=>sdk,emit:v=>views.push(v)});
await auth.init();assert(views.at(-1).ready);assert.equal(views.at(-1).user,null);
await auth.login('google');assert.equal(calls.at(-1).id,'google.com');assert.equal(calls.at(-1).params.prompt,'select_account');assert.equal(views.at(-1).user.uid,'google.com');assert.equal(views.at(-1).busy,false);
await auth.logout();assert.equal(views.at(-1).user,null);
await auth.login('apple');assert.equal(calls.at(-1).id,'apple.com');assert.deepEqual(calls.at(-1).scopes,['email','name']);assert.equal(calls.at(-1).params.locale,'de_DE');
logoutError={code:'auth/network-request-failed'};await auth.logout();assert(views.at(-1).user);assert.match(views.at(-1).error,/Internet/);logoutError=null;await auth.logout();
popupError={code:'auth/popup-closed-by-user'};await auth.login('google');assert.equal(views.at(-1).user,null);assert.equal(views.at(-1).busy,false);assert.match(views.at(-1).error,/abgebrochen/);
const previous=calls.length;await auth.login('unknown');assert.equal(calls.length,previous);
assert.match(authErrorMessage({code:'auth/popup-blocked'}),/Anmeldefenster/);
assert.match(authErrorMessage({code:'auth/unauthorized-domain'}),/freigeschaltet/);
assert.match(authErrorMessage({code:'unknown'}),/erneut/);
const disabled=createAuthController({config:{...config,providers:{apple:false}},loadSdk:async()=>sdk,emit:v=>views.push(v)});
await disabled.init();await disabled.login('apple');assert.equal(calls.length,previous);assert.match(views.at(-1).error,/freigeschaltet/);
console.log('Auth-Prüfung bestanden: unkonfigurierter Zustand, Google/Apple, Scopes, Sitzung, Abmeldung, Abbruch, Anbieterfehler und deaktivierte Anbieter.');
