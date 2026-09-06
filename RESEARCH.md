# Research

Problem: operators and creators repeatedly treat YouTube’s paid-promotion checkbox or a buried “thanks / collab” line as sufficient disclosure. Independent public sources describe the same gap.

## Sources (paraphrased)

1. FTC, *Endorsement Guides: What People Are Asking*  
   https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking  
   A description-only disclosure is not enough for video because many people never open the description. Clear wording belongs in the video itself.

2. Influencer Advisory, *FTC Influencer Disclosure Rules in 2026*  
   https://influenceradvisory.com/blog/ftc-influencer-marketing-updates/  
   Words that count include Ad, Sponsored, Paid partnership. Words that do not: thanks, collab, sp, spon, partner alone. YouTube: oral disclosure in the first 30 seconds plus written text above the fold. Platform toggles are required and still not enough.

3. r/PartneredYoutube threads on when to check the paid-promotion box (2024–2025)  
   Distinct commenters disagree about gifted products vs affiliate codes vs cash deals, which is the operational confusion this checklist encodes as explicit relationship types.

## Existing software

- Neil Fox repos (`creator-deal-math`, `utm-builder-neil`, `creator-link-kit`) cover fees, UTMs, and link hygiene. None score disclosure wording.
- GitHub search for “youtube ftc disclosure checklist” returned no matching product repo. Closest neighbors are SponsorBlock (skip segments) and an academic affiliate-disclosure study from 2018.

## Gap

A small, offline planner that turns those public rules into pass/fail checks without uploading scripts or calling YouTube APIs.
