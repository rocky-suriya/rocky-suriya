/* ai.js
 A minimal local AI engine for EvoLife.
 - evoReply(input) returns a reply string and an optional action.
 - Extend this file to connect to a remote LLM or local model.
*/

(function(global){
  function moodFromText(text){
    const s = text.toLowerCase();
    if(s.match(/sad|unhappy|depress|lonely|down/)) return 'sad';
    if(s.match(/happy|great|good|awesome|fantastic/)) return 'happy';
    if(s.match(/angry|mad|annoy/)) return 'angry';
    if(s.match(/tired|sleepy|exhaust/)) return 'tired';
    if(s.match(/stress|stressed|anxious/)) return 'anxious';
    return 'neutral';
  }

  // simple knowledge/responses
  const smallTalk = [
    "I'm Evo — your offline companion. Tell me how you feel today.",
    "I can save notes, track mood, and play calming sounds.",
    "Want a motivational quote or a breathing exercise?"
  ];

  function evoReply(input){
    const txt = (input||'').trim();
    if(!txt) return { reply: "Say anything — I'm listening 😊" };

    const lower = txt.toLowerCase();

    // greetings
    if(/^(hi|hello|hey)\b/.test(lower)) return { reply: "Hey! How are you feeling today?" };

    // help
    if(lower.includes('help') || lower.includes('what can you do')) return { reply: "I can save notes, track mood, give quotes, and help you relax. Try: 'I am sad' or 'motivate me'." };

    // emotions
    if(lower.includes('sad') || lower.includes("i'm sad")){
      return { reply: "I'm sorry you're feeling sad. Want a short breathing exercise or a motivating quote?", action: 'suggest_breathe' };
    }
    if(lower.includes('happy') || lower.includes("i'm happy")){
      return { reply: "That's wonderful — celebrate today! Want a quick gratitude exercise?", action: 'suggest_gratitude' };
    }

    // motivate
    if(lower.includes('motivate') || lower.includes('motivation') || lower.includes('inspire')){
      return { reply: "You are capable of more than you think. Take one small step today — what will that be?", action: 'quote' };
    }

    // small talk fallback
    if(lower.length < 30){
      // short replies
      const idx = Math.floor(Math.random()*smallTalk.length);
      return { reply: smallTalk[idx] };
    }

    // analyze mood and respond
    const mood = moodFromText(lower);
    if(mood !== 'neutral') return { reply: `I detect ${mood} — would you like a suggestion?`, action: 'mood:'+mood };

    // default fallback
    return { reply: "That's interesting — tell me a bit more, or ask me to 'save note' or 'show notes'."};
  }

  // export
  global.EvoAI = { evoReply, moodFromText };

})(window);