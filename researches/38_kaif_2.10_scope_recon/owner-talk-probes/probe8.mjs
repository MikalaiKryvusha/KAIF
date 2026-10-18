// probe 8 - renderMd (v2.9) on a Slack-mrkdwn "text" artifact body: *x* is BOLD in Slack, the page shows what?
import { renderMd } from './framework/tools/contour/core.mjs';
console.log(renderMd('*Total:* 5 crashes this week\n• first\n• second\n<https://example.invalid|link>\n'));
