"""Build the two printable A4 planning sheets linked from the topic guides."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
ROOT=Path(__file__).resolve().parents[1]

def build(filename,title,subtitle,fields,steps,notice,route):
 c=canvas.Canvas(str(ROOT/'public'/filename),pagesize=A4)
 c.setTitle(title+' | CheckMyBasket');c.setAuthor('CheckMyBasket')
 w,h=A4;x=42;right=w-42
 ink,muted,line,cream=[HexColor(s) for s in ['#161616','#555555','#CCCCCC','#FFF8F0']]
 def text(value,y,size=10,bold=False,col=ink,xx=x):
  c.setFillColor(col);c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(xx,y,value)
 c.setFillColor(cream);c.rect(0,h-125,w,125,fill=1,stroke=0)
 text('CheckMyBasket',h-40,14,True);text(title,h-76,23,True);text(subtitle,h-101,10,col=muted)
 y=h-154;cw=(right-x-24)/2
 text('YOUR PLAN',y,10,True);y-=23
 for left,rightlabel in fields:
  for xx,label in [(x,left),(x+cw+24,rightlabel)]:
   text(label,y,9,col=muted,xx=xx);c.setStrokeColor(line);c.line(xx,y-22,xx+cw,y-22)
  y-=48
 text('CHECK BEFORE YOU COMMIT',y-3,10,True);y-=30
 for step in steps:
  c.setStrokeColor(ink);c.setLineWidth(.8);c.rect(x,y-2,9,9);text(step,y,9.5,xx=x+18);y-=27
 c.setFillColor(cream);c.roundRect(x,y-39,right-x,49,5,fill=1,stroke=0)
 for index,n in enumerate(notice):text(n,y-7-index*14,9,xx=x+10)
 c.setStrokeColor(line);c.line(x,70,right,70)
 text('Read the full guide:',54,8.5,col=muted);text('www.checkmybasket.co.uk/'+route,39,9,True)
 c.linkURL('https://www.checkmybasket.co.uk/'+route,(x,35,right,49),relative=0)
 c.showPage();c.save()

build('remote-secret-santa-planner.pdf','Remote Secret Santa planner','Clear dates, private delivery details and a flexible reveal.',[
 ('Group / team','Organiser / contact'),('Total budget per person','Postage / wrapping included?'),('Joining deadline','Draw date'),('Arrival deadline','Reveal date, time and time zone'),('Participating locations','Approved private delivery channel'),('Reveal plan','Fallback handover plan')],[
 'Participation is optional; delivery coverage is agreed.',
 'Budget and delivery costs are explained in the invitation.',
 'Member list and exclusions checked before drawing.',
 'Everyone has time to add wishlist ideas and buy a gift.',
 'Current dispatch and delivery estimates checked.',
 'Private addresses and matches kept out of the group chat.',
 'Delayed parcels and absence have a named contact.',
],[ 'Do not write home addresses or assignments on this shared planner.', 'CheckMyBasket does not arrange shipping or collect addresses.' ],'remote-team-secret-santa')

build('engraving-order-checklist.pdf','Engraving order checklist','Confirm the wording, selected option and arrival timing.',[
 ('Recipient / preferred spelling','Occasion / required date'),('Product / chosen pattern','Presentation option'),('Exact wording - line 1','Exact wording - line 2, if supported'),('Font / position agreed with seller','Seller character / line limit'),('Quantity','Total budget including delivery'),('Making time confirmed','Delivery estimate confirmed')],[
 'Name, initials and date checked with the right person.',
 'Capitalisation, spaces and punctuation reviewed.',
 'Seller confirms wording fits the chosen engraving area.',
 'Symbols, font and position are supported.',
 'Selected product, box and quantity confirmed.',
 'Full delivered price and personalised-item terms checked.',
 'Time allowed for making, delivery and inspection.',
],[ 'This sheet prepares your order; it is not a seller production proof.', 'For several recipients, keep a separate row per person and design.' ],'money-clip-engraving-ideas')
print('Created two one-page A4 planning sheets')
