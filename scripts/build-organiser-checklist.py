"""Generate the public, one-page A4 organiser checklist (requires reportlab)."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

out = Path(__file__).resolve().parents[1] / 'public/secret-santa-organiser-checklist.pdf'
c = canvas.Canvas(str(out), pagesize=A4)
c.setTitle('Secret Santa Organiser Checklist | CheckMyBasket')
c.setAuthor('CheckMyBasket')
w, h = A4
ink, muted, line, cream = map(HexColor, ['#161616', '#555555', '#CCCCCC', '#FFF8F0'])
x, right = 42, w-42

def text(value, y, size=10, bold=False, colour=ink):
    c.setFillColor(colour)
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x, y, value)

c.setFillColor(cream); c.rect(0,h-132,w,132,fill=1,stroke=0)
text('CheckMyBasket', h-43, 14, True)
text('Secret Santa', h-77, 27, True)
text('Organiser checklist', h-105, 21, True)
text('Agree the plan. Keep the surprise. Tick each step as you go.', h-153, 10, colour=muted)
text('YOUR EXCHANGE PLAN', h-183, 10, True)
fields = [
 ('Group name', 'Organiser / contact'),
 ('Budget per person', 'Delivery / wrapping included?'),
 ('Joining deadline', 'Draw date'),
 ('Exchange date / time', 'Homemade gifts welcome?'),
 ('Location / remote delivery plan', 'Giver reveal rule'),
]
colw=(right-x-24)/2
y=h-205
for left_label,right_label in fields:
 for xx,label in [(x,left_label),(x+colw+24,right_label)]:
  c.setFont('Helvetica',9); c.setFillColor(muted); c.drawString(xx,y,label)
  c.setStrokeColor(line); c.line(xx,y-19,xx+colw,y-19)
 y-=43
text('BEFORE THE DRAW', y-1, 10, True)
y-=25
steps=[
 'Invite people to opt in; taking part is optional.',
 'Agree the budget and what delivery or wrapping costs it includes.',
 'Share the joining deadline, draw date and exchange arrangements.',
 'Check the member list: CheckMyBasket needs at least three joined people.',
 'Review any exclusion pairs in group settings before drawing names.',
 'Ask for wishlist ideas within the budget; allow time for shopping and delivery.',
 'Draw names once the member list and settings have been checked.',
]
def checkbox(value, yy):
 c.setStrokeColor(ink); c.setLineWidth(.8); c.rect(x,yy-2,9,9)
 c.setFillColor(ink); c.setFont('Helvetica',9.5); c.drawString(x+18,yy,value)
for step in steps: checkbox(step,y); y-=23
text('AFTER THE DRAW',y-2,10,True);y-=26
for step in [
 'Ask everyone to keep their match private.',
 'Send a reminder with the exchange date, time and location.',
 'Arrange handovers for anyone who cannot attend.',
]: checkbox(step,y);y-=23
c.setFillColor(cream);c.roundRect(x,y-30,right-x,36,5,fill=1,stroke=0)
c.setFillColor(ink);c.setFont('Helvetica',9)
c.drawString(x+10,y-7,'Keep private matches and delivery addresses off a shared checklist.')
c.setStrokeColor(line);c.line(x,69,right,69)
text('Rules, invitation templates and wishlist ideas:',53,8.5,colour=muted)
text('www.checkmybasket.co.uk/secret-santa-rules',39,9,True)
c.linkURL('https://www.checkmybasket.co.uk/secret-santa-rules',(x,36,right,49),relative=0)
c.showPage(); c.save()
print(out)
