# Check ids

| Id | Fail when |
| --- | --- |
| `platform_box` | Paid-promotion box is unchecked on a material connection |
| `verbal_first_30s` | Long-form video has no spoken plan in the first 30 seconds |
| `shorts_onscreen` | Shorts have neither an overlay nor a spoken line |
| `description_head` | First 160 characters lack a clear word (`ad`, `sponsored`, `paid partnership`, …) |
| `offer_near_disclosure` | Promo code or affiliate link without a clear word in the same opening block |

Weak-only words such as `thanks`, `collab`, `spon`, or `partner` alone do not pass `description_head`.
