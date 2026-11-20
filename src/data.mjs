export const sourceUrl = 'https://www.forestrussia.ru/catalog/banki';
export const productPath = p => '/catalog/banki/' + p.slug + '/';
export const nav = [['Главная','/'],['Каталог','/catalog/banki/'],['Производство','/production/'],['О нас','/about/'],['Оптовым покупателям','/wholesale/'],['Контакты','/contacts/'],['Купить','https://www.forestrussia.ru/roznica']];
export const brand = {name:'Русский лес',email:'hello@forestrussia.ru',orders:'order@forestrussia.ru',phone:'+7 982 234-17-17',address:'Пермский край, г. Очёр, ул. Боровая, 4',production:'Пермский край, г. Очёр, ул. Революционная, 27'};
const items = [
 {slug:'brusnika',name:'Брусника',lines:['ДЖЕМ ИЗ','БРУСНИКИ'],category:'Джем премиум',image:'https://morganic.ru/image/cache/catalog/Russkij-les/001/dzhem-bez-sahara-brusnika-premium-50-yagod-russkij-les-220g-1000x1000.jpg',description:'Цельная брусника с лёгкой лесной горчинкой и мягкой сладостью виноградного сока.',ingredients:'Состав: брусника, виноградный сок, фруктовый пектин.',note:'Без добавления сахара',tips:'Попробуйте с сырниками, блинами или выдержанным сыром. Ягодная кислинка хорошо дополняет и сладкие, и солёные блюда.',weights:['220 г'],shelf:'24 месяца'},
 {slug:'oblepiha',name:'Облепиха',lines:['ДЖЕМ ИЗ','ОБЛЕПИХИ'],category:'Джем премиум',image:'https://morganic.ru/image/catalog/Russkij-les/007/dzhem-bez-sahara-oblepiha-premium-50-yagod-russkij-les-220g.jpg',description:'Солнечная облепиха с яркой кислинкой и мягкой сладостью виноградного сока.',ingredients:'Состав: облепиха, виноградный сок, фруктовый пектин.',note:'Без добавления сахара',tips:'Добавьте к творогу, натуральному йогурту или утренней каше. Подавайте к тостам и домашней выпечке.',weights:['220 г'],shelf:'24 месяца'},
 {slug:'chernika',name:'Черника',lines:['ДЖЕМ ИЗ','ЧЕРНИКИ'],category:'Джем премиум',image:'https://morganic.ru/image/catalog/Russkij-les/008/dzhem-bez-sahara-chernika-premium-50-yagod-russkij-les-220g.jpg',description:'Глубокий вкус лесной черники — чуть терпкий, мягкий и по-летнему ягодный. В рецептуре — цельные ягоды, виноградный сок и фруктовый пектин.',ingredients:'Состав: черника, виноградный сок, фруктовый пектин.',note:'Без добавления сахара',tips:'Подавайте к тёплым блинам, сырникам и хрустящим тостам. Или просто возьмите ложку и устройте маленькое чаепитие.',weights:['220 г'],shelf:'24 месяца'},
 {slug:'sosnovaya-shishka',name:'Сосновая шишка',lines:['СОСНОВАЯ','ШИШКА'],category:'Классическое варенье',image:'https://static.tildacdn.com/tild3630-3233-4334-b366-383933666561/Group_916_3.png',description:'Лесной десерт из молодых сосновых шишек. Густой янтарный сироп и хвойный аромат превращают обычное чаепитие в маленькое путешествие в лес.',ingredients:'Варенье из зелёных сосновых шишек. Подробный состав и варианты фасовки — в каталоге производителя.',note:'Настоящий лесной вкус',tips:'Подавайте небольшими порциями к чаю. Сочетайте с мягким сыром, творожными десертами или домашней выпечкой.',weights:['Уточнить в каталоге'],shelf:'Указан на упаковке',cutout:true}
];
// Complete premium range listed by the manufacturer: https://forestrussia.ru/jamopt
for (const [slug,name,lines,folder,file,description,ingredients] of [
 ['ezhevika','Ежевика',['ДЖЕМ ИЗ','ЕЖЕВИКИ'],'002','ezhevika','Мягкий вкус спелой ежевики и нежный ягодный аромат.','Ежевика, концентрированный виноградный сок, фруктовый пектин.'],
 ['klubnika','Клубника',['ДЖЕМ ИЗ','КЛУБНИКИ'],'003','klubnika','Сладкая клубника с нежным летним ароматом. Для неспешного завтрака и домашних десертов.','Клубника, концентрированный виноградный и яблочный сок, фруктовый пектин.'],
 ['klyukva-chernika','Клюква и черника',['КЛЮКВА','И ЧЕРНИКА'],'004','klyukva-chernika','Кислинка клюквы и мягкий вкус черники в одной баночке.','Концентрированный виноградный сок, черника, клюква, фруктовый пектин.'],
 ['krasnaya-smorodina','Красная смородина',['КРАСНАЯ','СМОРОДИНА'],'005','krasnaya-smorodina','Яркая красная смородина с приятной кислинкой и умеренной сладостью.','Красная смородина, концентрированный виноградный сок, фруктовый пектин.'],
 ['malina','Малина',['ДЖЕМ ИЗ','МАЛИНЫ'],'006','malina','Знакомый вкус спелой малины и тёплый аромат летнего чаепития.','Малина, концентрированный виноградный сок, фруктовый пектин.'],
 ['malina-brusnika','Малина и брусника',['МАЛИНА','И БРУСНИКА'],null,null,'Нежная малина и брусничная кислинка. Два ягодных характера в одном джеме.','Малина, брусника, виноградный сок, фруктовый пектин.']
]) items.push({slug,name,lines,category:'Джем премиум',image:folder?'https://morganic.ru/image/catalog/Russkij-les/'+folder+'/dzhem-bez-sahara-'+file+'-premium-50-yagod-russkij-les-220g.jpg':'https://www.russiantable.com/cdn/shop/files/pine-26.jpg?v=1714414803&width=1000',description,ingredients:'Состав: '+ingredients,note:'Без добавления сахара',tips:'Подавайте к блинам, творогу, тостам или домашней выпечке.',weights:['220 г'],shelf:'24 месяца'});
const assortment='https://static.tildacdn.com/tild3639-6532-4636-b836-306539613233/1619653737.png';
// Local transparent packshots; retain source URLs above for provenance.
for (const p of items) {
  p.sourceImage = p.image;
  p.image = '/images/products/' + p.slug + '-hd.png';
  p.enhanced = true;
  p.cutout = false;
}
export const products=items.map(p=>({...p,alt:'Русский лес — '+p.name,photos:[{src:p.image,alt:p.name+' — Русский лес'},{src:assortment,alt:'Ягодные джемы Русский лес'},{src:p.image,alt:'Банка '+p.name}],layouts:({brusnika:[{intro:738,meta:326},{intro:692,meta:571},{intro:472,meta:565}],oblepiha:[{intro:697,meta:245},{intro:696,meta:519},{intro:440,meta:490}],chernika:[{intro:827,meta:411},{intro:915,meta:649},{intro:683,meta:691}]})[p.slug]||[{intro:650,meta:326},{intro:610,meta:571},{intro:500,meta:565}]}));
for(const p of products){
 p.related=products.filter(x=>x!==p);
 p.photos=[p,p.related[0],p.related[1]].map(item=>({src:item.image,alt:item.alt,cutout:item.cutout,enhanced:item.enhanced,slug:item.slug}));
}
export const legacySlugs={smeraldo:'brusnika',marmellata_arancia:'oblepiha',caponata:'chernika',pestorosso:'sosnovaya-shishka',fregole_bacche:'brusnika',smeralda:'chernika',gelsi_neri:'chernika',cipolla:'sosnovaya-shishka',mennulata:'brusnika',pera_cannella:'oblepiha'};
