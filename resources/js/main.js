//'use strict';

var app = {
    start:function(){
        fetch('/resources/data/data.json').then(resp=>{
            if(resp.ok){ return resp.json(); }
            throw new Error('Something went wrong.\nPlease refresh the page.');
        }).then(res=>{
            app.init(res);
        }).catch(er=>{
            document.body.innerHTML='';
            alert(er);
        });

    },
    init:function(jData){
        app.data.jData=jData;
        if(!app.db.init(jData.local_db)) { return; }
        app.menu.init();
        app.home.init();
        app.funMode.init();
    },
    data:{
        jData:null,
        myForm: null
    },
    helper:{
        html:{
            customConfirm:{//To Do
                element:null,
                open:function(message){
                    
                    let t = app.helper.html.customConfirm; if(t.element) { t.element.remove(); }
                    
                    
                    t.element = document.createElement('div'); t.element.className='customConfirm';
                    let cont = document.createElement('div'); t.element.appendChild(cont);

                    let msg = document.createElement('div'); msg.innerHTML = message; cont.appendChild(msg);

                    let btnCont = document.createElement('div');
                    let btnOk = document.createElement('button'); btnOk.value = true; btnOk.innerHTML='Yes'; btnCont.appendChild(btnOk);
                    let btnCancel = document.createElement('button'); btnCancel.value = false; btnCancel.innerHTML='No'; btnCont.appendChild(btnCancel);
                    cont.appendChild(btnCont);

                    btnOk.addEventListener('click',t.result);
                    btnCancel.addEventListener('click',t.result);
                    
                    document.getElementById('Rcontainer').appendChild(t.element);
                },
                result:function(e){
                    e.preventDefault();

                    alert(this.value);
                }
            },
            elementSetAttributes:function(el, attributes){
                Object.keys(attributes).forEach(attr => { el.setAttribute(attr,attributes[attr]); });
            },
            getInputTypeByIdElseTryName:function(id){
                let el = document.getElementById(id);
                if(el == null){
                    el = document.getElementsByName(id);
                    if(el){ for(var i=0;i<el.length;i++){ return el[i].type; } }
                }
                else{
                    if(el){ return el.type; }
                }
                return null;
            },
            getInputValueDecideFromIdElseTryName:function(id){
                let elType = app.helper.html.getInputTypeByIdElseTryName(id);
                switch(elType){
                    case 'radio': app.helper.html.getRadioGroupValue(id); break;
                    case 'null': return ''; break;
                    default: 
                        return document.getElementById(id).value.trim();
                    break;
                }
            },
            setRadioGroupValue:function(name,value){
                let el = document.getElementsByName(name);
                for(var i=0;i<el.length;i++){ if(el[i].value==value) el[i].checked=true; }
            },
            setRadioGroupValueFirstChild:function(name){
                let el = document.getElementsByName(name);
                if(el && el.length>0) el[0].checked=true;  
            },
            clearInputDecideFromTypeByIdElseTryName:function(id){
                let elType = app.helper.html.getInputTypeByIdElseTryName(id);
                switch(elType){
                    case 'radio': app.helper.html.setRadioGroupValueFirstChild(id); break;
                    case 'null': break;
                    default: 
                        let el = document.getElementById(id);
                        if(el !== null) { el.value=''; }
                    break;
                }
            },
            getRadioGroupValue:function(name){
                let el = document.getElementsByName(name);
                for(var i=0;i<el.length;i++){ if(el[i].checked) return el[i].value; }
            },
            setBgDiv:function(owner){
                let bgDiv = document.createElement('div'); 
                bgDiv.className='bgdiv'; owner.appendChild(bgDiv);
            }
        },
        message:{
            set:function(htmlText,messageType){
                let el = document.getElementById('form-message');

                switch(messageType){
                    case 'success': el.className = 'form-message-content form-message-success'; break;
                    case 'warning': el.className = 'form-message-content form-message-warning'; break;
                    case 'danger': el.className = 'form-message-content form-message-danger'; break;
                    default: el.className = 'form-message-content form-message-info'; break;
                }
                el.innerHTML = htmlText;
            },
            clear:function(){
                let el = document.getElementById('form-message');
                el.className = 'form-message-empty';
                el.innerHTML='&nbsp;';
            }
        },
        misc:{
            isNumber: function (val) {
                if (val.toString().trim() == '') return false;
                if (isNaN(val)) return false;
                return true;
            },
            tryParseNumberElseString: function (val) {
                if (app.helper.misc.isNumber(val)) { return Number(val); }
                return val;
            }
        }
    },
    menu:{
        init:function(){
            let jData = app.data.jData;

            for(const p in jData.navBar){ jData.navBar[p].buttons = []; }

            for(let key in jData.forms){
                let item = jData.forms[key];
                if(item.hasOwnProperty('nav')){
                    jData.navBar[item.nav.group].buttons.push({formKey:key,name:item.nav.button.name,text:item.nav.button.text});
                }
            }
            
            document.getElementById('side-nav').innerHTML='';
            Object.values(jData.navBar).forEach(item=>{
                if(item.buttons.length){
                    let details = document.createElement('details'); details.setAttribute('open','');
                    let summary = details.appendChild(document.createElement('summary'));
                    app.helper.html.elementSetAttributes(summary.appendChild(document.createElement('span')),{class:'nav-icon', style:`background-image:url(${jData.folders.img}/${item.img})`});
                    summary.appendChild(document.createElement('span')).textContent=item.text;
                    item.buttons.forEach(el=>{
                        let btn = document.createElement('button');
                        btn.name=el.name; btn.textContent=el.text;
                        btn.addEventListener('click', ()=>{ app.forms.create(el.formKey,el.name); });
                        details.appendChild(btn);
                    });
                    document.getElementById('side-nav').appendChild(details);
                }
            });
        }
    },
    home:{
        init:function(){
            //document.getElementById('main-forms').innerHTML=':D'

            let mainContainer = document.getElementById('main-forms'); mainContainer.innerHTML='';
            let wrapper = document.createElement('div'); wrapper.className='form-wrapper'; 
            let cont = document.createElement('div'); wrapper.appendChild(cont);
            cont.style='text-align:left;'
            let o = document.createElement('h1'); o.innerHTML='Welcome';cont.appendChild(o);

            cont.appendChild(document.createElement('hr'));
            
            let data = app.data.jData.navBar;
            for(const p in data){ 
                let article = document.createElement('article'); 
                let par = document.createElement('p'); 
                let div = document.createElement('div'); div.className='article-img'; div.style=`background-image:url(${app.data.jData.folders.img}/${data[p].img_large}`;
                
                par.innerHTML = `Total ${data[p].text} : ${app.db.countTable(p)}`;
                article.appendChild(div); article.appendChild(par);
                
                cont.appendChild(article);
            }
            
            app.helper.html.setBgDiv(mainContainer);
            mainContainer.appendChild(wrapper);
        }
    },
    funMode:{
        opened:false,
        init:function(){
            let jData = app.data.jData;
            let dbData = app.funMode.getLocalData();

            let details = document.createElement('details'); details.setAttribute('open','');
            let summary = details.appendChild(document.createElement('summary'));
            app.helper.html.elementSetAttributes(summary.appendChild(document.createElement('span')),{class:'nav-icon', style:`background-image:url(${jData.folders.img}/${'nav-fun.png'})`});
            summary.appendChild(document.createElement('span')).textContent='Fun mode';

            let btn = document.createElement('button');
            btn.name='btnFun'; btn.id='btnFunOpenClose'; btn.innerHTML=(dbData.opened?'Close':'Open');
            btn.addEventListener('click', ()=>{ app.funMode.openClose(); });
            details.appendChild(btn);

            document.getElementById('side-nav').appendChild(details);
                
            app.funMode.opened=dbData.opened;
        },
        randData:{
            getRandIntInclusive:function(min,max){
                min = Math.ceil(min); max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
            courses:{
                titles:['Python,Py', 'R and Software Development,R', 'Fundamentals of Java Programming,Java', 'Web Development or Full Stack Developer,Full Stack', 'Google Cloud Platform Architecture,Google', 'JavaScript,Javascript', 'Angular 6,Angular', 'Redux and React,Redux', 'Android N Developer,Android', 'iOS 11 and Swift Developer,iOS', 'Node.js Developer,Node', 'C++ and Unreal Engine Developer Course,C++', 'Master Jenkins,Mj', 'Docker Mastery,Docker', 'Cyber Security Course,CSC', 'M.Sc. in Computer Science,Msc', 'PG Diploma in Blockchain,PG', 'PG Certificate Program in Big Data & Analytics,PG BDA', 'PG Program in Big Data Engineering,PG BDE', 'Master of Science in Data Science,Master', 'PG Diploma in Machine Learning and AI,AI', 'Advanced Certification in Machine Learning,AI', 'Advanced Cert in Machine Learning – IIT Delhi,AI Delphi', '(C-Sharp) Online Courses for Beginners,C#', 'C# Fundamentals by Coding,C#', 'C# Intermediate: Classes,C#', 'C# Advanced: Prepare for Technical Interviews,C#', 'Introduction to C# Programming and Unity,C#', 'C# Fundamentals by Scott Allen (Pluralsight),C#', 'Data Structures for Coding Interviews in C#,C#'],
                getData:function(){
                    let t = app.funMode.randData.courses;
                    let rn = Math.floor(Math.random() * t.titles.length);
                    let data = { id: '', title: t.titles[rn].split(',')[0], stream: t.titles[rn].split(',')[1], type: app.funMode.randData.getRandIntInclusive(0, 1), startDate: '', endDate: '' };
                    let date = new Date(app.funMode.randData.getRandIntInclusive(2022, 2024).toString());
                    date.setDate(date.getDate() - app.funMode.randData.getRandIntInclusive(1, 365)); data.startDate = date.toJSON().split('T')[0];
                    date.setDate(date.getDate() + app.funMode.randData.getRandIntInclusive(180, 365)); data.endDate = date.toJSON().split('T')[0];
                    return data;
                }
            },
            trainers:{
                names:['Lara Michelangeli', 'Sole Cilea', 'Martina Gelli-Piazzi', 'Giancarlo Pacomio', 'Giuliano Battaglia-Callegaro', 'Fedele Nadi', 'Guglielmo Sibilia', 'Salvatore Priuli', 'Angelica Franscini', 'Mattia Gucci', 'Elmo Vattimo', 'Eraldo Brambilla', 'Filippa Ughi', 'Patrizio Giorgetti', 'Ferdinando Antonini', 'Amleto Bertolucci-Favata', 'Daria Manzoni', 'Elladio Pacelli-Montessori', 'Vittoria Cainero', 'Dante Grifeo', 'Giovanni Renier', 'Giovanna Cerquiglini', 'Lolita Rinaldi', 'Santino Nitto', 'Etta Stein', 'Alina Brunello', 'Nico Moresi-Ruffini', 'Nanni Longhena-Lucciano', 'Mauro Dibiasi', 'Telemaco Navarria', 'Marcella Musatti', 'Emma Pezzali', 'Elvira Palmisano', 'Paoletta Mannoia', 'Antonello Filangieri', 'Valentina Zola', 'Patrizia Tarantino', 'Tonino Tomasetti', 'Flavia Leoncavallo', 'Stella Doglioni', 'Silvio Gadda', 'Olga Franceschi', 'Gianna Casini', 'Tiziano Gotti', 'Ludovico Chiaramonte', 'Paoletta Visconti', 'Raffaellino Trobbiani-Barcaccia', 'Beatrice Cilea', 'Ramona Callegari', 'Pierpaolo Canali', 'Luigi Carullo', 'Pina Parri-Boitani', 'Orlando Abbagnale', 'Pomponio Morabito', 'Sandra Pisacane', 'Irma Crispi-Tasca', 'Adele Varano', 'Annalisa Boccherini', 'Marisa Caboto', 'Rosa Semitecolo', 'Iolanda Giammusso', 'Nicoletta Valentino', 'Lidia Pisacane', 'Ettore Boccioni', 'Fernanda Ravaglioli', 'Maura Roccabonella', 'Giuseppina Tarantini', 'Silvia Tamborini', 'Eva Sorrentino-Marenzio', 'Liana Ottino'],
                subs:['Py','R','Java','Full Stack','Google','Javascript','Angular','Redux','Android','iOS','Node','C++','Mj','Docker','CSC','Msc','PG','PG BDA','PG BDE','Master','AI','AI Delphi','C#'],
                getData:function(){
                    let t = app.funMode.randData.trainers;
                    let rn = Math.floor(Math.random() * t.names.length);
                    let data = { id: '', firstName: t.names[rn].split(' ')[0], lastName: t.names[rn].split(' ')[1], subject: t.subs[Math.floor(Math.random() * t.subs.length)] };
                    return data;
                }
            },
            students:{
                names:['Katherine Hall', 'Anthony White', 'Terri Guzman', 'James Thomas', 'Christopher Roy', 'Stephanie Dean', 'Cameron Davis', 'Joseph Nguyen', 'Daniel Humphrey', 'Marie Boyle', 'Deborah Jackson', 'Henry Pena', 'Mary Hughes', 'Christopher Blankenship', 'Jonathan Harper', 'James Williams', 'Michael Carlson', 'Devin Mullins', 'Jacob Johnson', 'Latoya Orozco', 'Michael Gonzalez', 'Nancy Jefferson', 'Susan Hendricks', 'Reginald Duncan', 'Diane Daniel', 'Jeremy Gordon', 'Gilbert Martin', 'Steven Sullivan', 'Dana Reyes', 'Tiffany Sanchez', 'Scott Grant', 'Brett Hill', 'Hannah Hall', 'Jason Riley', 'Frank Boyd', 'Scott Shepard', 'Stephanie Weiss', 'Justin Small', 'Debra Rose', 'Evelyn Hall', 'Morgan Foley', 'Joshua Miller', 'Jessica Stein', 'Alyssa Barajas', 'Joseph Hunt', 'Robert Reed', 'Cynthia Wells', 'Jill Ruiz', 'Paula Peterson', 'Alice Fisher', 'Ronald Clark', 'Brittany Ramsey', 'Kevin Owens', 'David Martin', 'Tammy Mckenzie', 'David Miranda', 'Joseph Rogers', 'David Walters', 'Christina Taylor', 'Kelly Gibson', 'Jennifer Smith', 'Jerry Ruiz', 'Lisa Rodriguez', 'Donna Gray', 'Christopher Reese', 'Jonathan Thornton', 'Lisa Walker', 'Lisa Price', 'Dustin Thomas'],
                getData:function(){
                    let t = app.funMode.randData.students;
                    let rn = Math.floor(Math.random() * t.names.length);
                    let data = { id: '', firstName: t.names[rn].split(' ')[0], lastName: t.names[rn].split(' ')[1], dateOfBirth: '', tuitionFees: app.funMode.randData.getRandIntInclusive(5, 30)*100 };
                    let date = new Date(app.funMode.randData.getRandIntInclusive(1965, 2005).toString());
                    date.setDate(date.getDate() - app.funMode.randData.getRandIntInclusive(1, 365)); data.dateOfBirth = date.toJSON().split('T')[0];
                    return data;
                }
            },
            assignments:{
                lorem:['Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Recusandae omnis numquam atque quod dicta ullam obcaecati.', 'Quae atque porro aliquam beatae,', 'incidunt id velit.', 'Reiciendis facilis excepturi eum iure exercitationem?', 'Consequatur, repellendus libero consequuntur aperiam facilis cumque doloribus deserunt eveniet quos totam nemo sint modi dolores alias tempora, veniam rerum praesentium numquam!'],
                getData:function(){
                    let t = app.funMode.randData.assignments;

                    let loremStr = t.lorem[0];
                    while(true){
                        let newLorem = t.lorem[app.funMode.randData.getRandIntInclusive(1, t.lorem.length - 1)];
                        if((loremStr + ' ' + newLorem).length > 300) { break; }
                        loremStr += ' ' + newLorem;
                    }
                    let data = { id: '', title: 'Assignment ' + app.funMode.randData.getRandIntInclusive(16, 50), description: loremStr, subDateTime: '', oralMark: app.funMode.randData.getRandIntInclusive(1, 20)*5, totalMark: app.funMode.randData.getRandIntInclusive(1, 20)*5 };
                    let date = new Date(app.funMode.randData.getRandIntInclusive(2022, 2025).toString());
                    date.setDate(date.getDate() + app.funMode.randData.getRandIntInclusive(1, 365)); data.subDateTime = date.toJSON().split('.')[0];
                    return data;
                }
            }
        },
        getLocalData: function(){
            return JSON.parse(localStorage.getItem('FunMode'));
        },
        openClose:function(){
            let data = app.funMode.getLocalData();
            let btn = document.getElementById('btnFunOpenClose');

            if(data.opened){
                btn.innerHTML='Open';
                data.opened=!data.opened; localStorage.setItem('FunMode',JSON.stringify(data));
            }
            else{
                btn.innerHTML='Close';
                data.opened=!data.opened; localStorage.setItem('FunMode',JSON.stringify(data));
            }
            app.funMode.opened=data.opened;
            
            window.location.replace('/');
        }
    },
    forms:{
        create:function(formKey,btnName){
            Object.values(app.data.jData.navBar).forEach(item=>{
                if(item.buttons.length){
                    item.buttons.forEach(el=>{
                        let btn = document.getElementsByName(el.name)[0];
                        if(btnName==el.name){ if(!btn.classList.contains('active')) { btn.className+=' active'; } }
                        else{ btn.className = btn.className.replace(' active', ''); }
                    });
                }
            });
            
            let crEl = (owner,tagName,iHTML=null,className=null)=>{
                let o = document.createElement(tagName);
                if(iHTML != null) o.innerHTML=iHTML;
                if(className != null) o.className=className;
                return owner.appendChild(o);
            };
            
            let crInput = (owner,item)=>{
                let props = ['id','name','type','class','value','textContent','minLength','maxLength','min','max','placeholder','alt','rows','cols','multiple','required','checked','disabled'];
                let o = document.createElement(item.tag);
                //for (let p of props){ if(item.hasOwnProperty(p)) o[p] = item[p]; }
                for (let p of props){ if(item.hasOwnProperty(p)) o.setAttribute(p,item[p]); }


                if(item.type=='radio'){
                    let label = document.createElement('label'); label.appendChild(o);
                    let span = document.createElement('span'); span.innerHTML = item.text; label.appendChild(span); 
                    if(item.hasOwnProperty('spanClass')) { span.className=item.spanClass; }
                    owner.appendChild(label);
                    return o;//owner.appendChild(label);
                }
                else{
                    if(item.hasOwnProperty('text')) o.innerHTML = item['text'];
                }
                if(item.tag=='select' && item.hasOwnProperty('title')){ let opt = document.createElement('option'); opt.disabled=true; opt.selected=true; opt.textContent=item.title; o.appendChild(opt); }
                return owner.appendChild(o);
            };
            
            app.data.myForm = app.data.jData.forms[formKey];
            let main = app.data.myForm.main;
            main.formModes.current=0; main.formModes.elements={};
            app.data.myForm.dbData.lastSelectedKey='';

            let formsContainer = document.getElementById('main-forms'); formsContainer.innerHTML='';
            app.helper.html.setBgDiv(formsContainer);

            let wrapper = document.createElement('div'); wrapper.className='form-wrapper';
            let form = crEl(wrapper,'form'); form.action=''; form.autocomplete='off';
            let cont = crEl(form,'div',null,'Rcontainer'); cont.id='Rcontainer'

            //Header
            main.header.forEach(item=>{ crEl(cont,'h1',item.title); }); crEl(cont,'hr');

            let row;
            //Modes
            if (main.hasOwnProperty('formModes') && main.formModes.selector.elems.length > 0) {
                
                row = crEl(cont,'div',null,'Rrow-col-1');
                let selector = main.formModes.selector;
                let div = crEl(row,'div',null,selector.class);
                selector.elems.forEach(el=>{ 
                   let radio = crInput(div,el);
                   main.formModes.elements[radio.value]=[];
                   if(radio.checked) main.formModes.current=radio.value;
                   radio.addEventListener('click',app.forms.onModeChange);
                });
                crEl(cont,'div','&nbsp;','Rrow-col-1 Rrow-line');
            }

            //PreBody Elements
            if(main.hasOwnProperty('preBody')){
                main.preBody.forEach(item=>{
                    row = crEl(cont,'div',null,'Rrow-col-1');
                    let div = crEl(row,item.container,null,item.class);
                    item.elems.forEach(el=>{ 
                        let sel=crInput(div,el); 
                        if(sel.tagName.toLowerCase()=='select') { sel.addEventListener('change',app.forms.selects.itemEdit.change); }
                    });
                    if(item.hasOwnProperty('inmode')){
                        for(let mode of item.inmode){ main.formModes.elements[mode].push(row); }
                        if(item.inmode.indexOf(main.formModes.current)==-1){ row.classList.add('hidden'); }
                    }
                });
                //crEl(cont,'div','&nbsp;','Rrow-col-1 Rrow-line');
            }
            
            //Body
            //row = crEl(cont,'div',null,'Rrow-col-2');
            main.body.forEach(item=>{
                row = crEl(cont,'div',null,'Rrow-col-' + (item.colSpan+1));

                if(item.hasOwnProperty('inmode')){
                    let contDiv = crEl(cont,'div',null,'Rrow-col-2');
                    cont.insertBefore(contDiv,row);
                    crEl(contDiv,'div',item.header);
                    let div = crEl(contDiv,'div',null,(item.hasOwnProperty('class')? item.class:null));
                    item.elems.forEach(el=>{ crInput(div,el); });

                    for(let mode of item.inmode){ main.formModes.elements[mode].push(contDiv); }
                    if(item.inmode.indexOf(main.formModes.current)==-1){ contDiv.classList.add('hidden'); }
                }
                else if (item.colSpan==1){
                    crEl(row,'div',item.header);
                    let div = crEl(row,'div',null,(item.hasOwnProperty('class')? item.class:null));
                    item.elems.forEach(el=>{ crInput(div,el); });
                }
                else{
                    crEl(row,'div',item.header);
                    
                    item.elems.forEach(el=>{ 
                        let div = crEl(row,'div',null,(item.hasOwnProperty('class')? item.class:null));
                        let o = crInput(div,el); 
                        if(el.tag=='button') { o.addEventListener('click',app.forms.buttons.click); }
                    });
                }        
            });
            crEl(cont,'div','&nbsp;','Rrow-col-1 Rrow-line');

            //Footer
            row = crEl(cont,'div',null,'Rrow-col-1');
            main.footer.forEach(item=>{
                let div = crEl(row,item.container,null,item.class);
                item.elems.forEach(el=>{ 
                    if(el.value=='Rand' && !app.funMode.opened) { return; }
                    let btn=crInput(div,el);
                    btn.addEventListener('click',app.forms.buttons.click);

                    if(el.hasOwnProperty('inmode')){
                        for(let mode of el.inmode){ main.formModes.elements[mode].push(btn); }
                        if(el.inmode.indexOf(main.formModes.current)==-1){ btn.classList.add('hidden'); }
                    }
                });  
            });

            //Info message
            row = crEl(cont,'div',null,'Rrow-col-1');
            let div = crEl(row,'div','&nbsp'); div.id="form-message";

            formsContainer.appendChild(wrapper);
            app.forms.selects.itemEdit.updateData();
        },
        clear:function(){
            let myForm = app.data.myForm;
            Object.values(myForm.dbData.cels).forEach(id=>{
                app.helper.html.clearInputDecideFromTypeByIdElseTryName(id);
            });
            myForm.dbData.lastSelectedKey='';
            //if (myForm.main.formModes.current == 'edit'){ app.forms.selects.itemEdit.updateData(); }
            app.forms.selects.itemEdit.updateData();
        },
        onModeChange:function(){
            let newMode = this.value;
            let main = app.data.myForm.main;
            if(newMode==main.formModes.current) return;

            app.helper.message.clear();

            for(let key in main.formModes.elements){
                for(let el of main.formModes.elements[key]){
                    el.classList.toggle('hidden');
                }
            }
            main.formModes.current=newMode;
            app.forms.clear();
        },
        selects:{
            itemEdit:{
                lastSelectedKey:{
                    isEmpty:function(){
                        //app.data.myForm.dbData.lastSelectedKey='';
                        let v = app.data.myForm.dbData.lastSelectedKey.toString().trim();
                        if(v=='' || v=='-1') { return true; }
                        return false;
                    }
                },
                updateData:function(setLastSelectedKey){
                    let main = app.data.myForm.main;
                    if(main.hasOwnProperty('preBody')){
                        main.preBody.forEach(item=>{
                            if(!main.formModes.selector.has || item.inmode.indexOf(main.formModes.current)>-1){
                                item.elems.forEach(el=>{
                                    let data = app.db.selectFromTable(el.data.table, [el.data.value, el.data.text, el.data.text2]).data;
                                    let sel = document.getElementById(el.id); sel.length=1; sel.options[0].selected=true;
                                    for(let i=0;i<data.length;i++){
                                        let opt = document.createElement('option'); opt.value=data[i][el.data.value]; 
                                        opt.textContent = data[i][el.data.text] + (el.data.text2 != '' ? ' ' + data[i][el.data.text2] : '');
                                        sel.appendChild(opt);
                                        if(setLastSelectedKey && opt.value==app.data.myForm.dbData.lastSelectedKey) opt.selected=true;
                                    }
                                });
                            }
                        });
                    }
                },
                change:function(){
                    let sel=document.getElementById(this.id);
                    let myForm = app.data.myForm;
                    app.helper.message.clear();
                    
                    if(myForm.dbData.multiSelect){
                        let multi = myForm.dbData.multiCels;
                        let fromDbCols = [multi.fromDb.key]; multi.fromDb.cells.forEach(v=>{fromDbCols.push(v);});
                        let dbRes = app.db.selectFromTable(multi.fromDb.db,fromDbCols);
                        if(dbRes.success){
                            myForm.dbData.lastSelectedKey = this.value;

                            let toIds = [];
                            for(let row of dbRes.data){ if(row[multi.fromDb.cells[0]]==this.value){ toIds.push(row[multi.fromDb.cells[1]]) } }
                            let toDbCols = [multi.toDb.key]; multi.toDb.cells.forEach(v=>{ toDbCols.push(v); });
                            dbRes = app.db.selectFromTable(multi.toDb.db,toDbCols);
                            if(dbRes.success){
                                let el_In = document.getElementById(multi.selectors.in); el_In.length=0;
                                let el_Out = document.getElementById(multi.selectors.out); el_Out.length=0;
                                for(let row of dbRes.data){
                                    let opt = document.createElement('option');
                                    opt.value = row[multi.toDb.key]; opt.text = row[multi.toDb.cells[0]] + (multi.toDb.cells[1] != '' ? ' ' + row[multi.toDb.cells[1]] : '');
                                    if(toIds.includes(row[multi.toDb.key])){ el_In.appendChild(opt); }
                                    else{ el_Out.appendChild(opt); }
                                }
                            }
                        }
                    }
                    else{
                        let dbRes = app.db.selectFromTable(myForm.dbData.table,Object.keys(myForm.dbData.cels),myForm.dbData.key,sel.value);
                    
                        if(dbRes.success){
                            myForm.dbData.lastSelectedKey = dbRes.data[0][myForm.dbData.key];
                            for(let key in dbRes.data[0]){
                                if(key==myForm.dbData.key && myForm.dbData.cels[key]=='') continue;
                                let el = document.getElementById(myForm.dbData.cels[key]);
                                if(el==null || el==undefined){ app.helper.html.setRadioGroupValue(myForm.dbData.cels[key],dbRes.data[0][key]); }
                                else{ el.value = dbRes.data[0][key]; }
                            }
                        }
                        else{ app.helper.message.set(dbRes.message, 'info'); }
                    }
                    
                }
            }
        },
        buttons:{
            click:function(e){
                e.preventDefault();
                let myForm = app.data.myForm;
                app.helper.message.clear();
                
                let data = {}; let dbRes;
                
                switch(this.value){
                    case 'Rand':
                        let randData = app.funMode.randData[myForm.dbData.table].getData();

                        for (let key in myForm.dbData.cels) {
                            if(key==myForm.dbData.key) {continue;}
                            let el = document.getElementById(myForm.dbData.cels[key]);
                            if (el == null || el == undefined) { app.helper.html.setRadioGroupValue(myForm.dbData.cels[key],randData[key]); }
                            else { el.value = randData[key]; }
                        }
                    break;
                    case 'select-add':
                        if(app.forms.selects.itemEdit.lastSelectedKey.isEmpty()){ app.helper.message.set('Please select an item first!', 'warning'); return; }
                        var totalAffected = 0;
                        for(let opt of document.getElementById(myForm.dbData.multiCels.selectors.out).options){
                            if (!opt.selected) { continue; }
                            data[myForm.dbData.multiCels.fromDb.cells[0]]=Number(myForm.dbData.lastSelectedKey);
                            data[myForm.dbData.multiCels.fromDb.cells[1]]=Number(opt.value);
                            dbRes = app.db.insertIntoTable(myForm.dbData.multiCels.fromDb.db, data); 
                            totalAffected++;
                        }
                        if(totalAffected){
                            if (dbRes.success) {
                                app.forms.selects.itemEdit.updateData(true); 
                                app.forms.selects.itemEdit.change.call(document.getElementById('select_item_edit'));
                                app.helper.message.set(`Successfully added ${totalAffected} item${(totalAffected>1?'s':'')}!`, 'info');
                            } else { app.helper.message.set(dbRes.message, 'warning'); }
                        } else { app.helper.message.set('Please select an item first!', 'warning'); return; }
                    break;

                    case 'select-remove':
                        if(app.forms.selects.itemEdit.lastSelectedKey.isEmpty()){ app.helper.message.set('Please select an item first!', 'warning'); return; }
                        var totalAffected = 0;
                        for(let opt of document.getElementById(myForm.dbData.multiCels.selectors.in).options){
                            if (!opt.selected) { continue; }
                            data[myForm.dbData.multiCels.fromDb.cells[0]]=Number(myForm.dbData.lastSelectedKey);
                            data[myForm.dbData.multiCels.fromDb.cells[1]]=Number(opt.value);
                            dbRes = app.db.deleteFromTableWhereCells(myForm.dbData.multiCels.fromDb.db, data);
                            totalAffected++;
                        }
                        if(totalAffected){
                            if (dbRes.success) {
                                app.forms.selects.itemEdit.updateData(true);
                                app.forms.selects.itemEdit.change.call(document.getElementById('select_item_edit'));
                                app.helper.message.set(`Successfully removed ${totalAffected} item${(totalAffected>1?'s':'')}!`, 'info');
                            } else { app.helper.message.set(dbRes.message, 'warning'); }
                        } else { app.helper.message.set('Please select an item first!', 'warning'); return; }
                    break;

                    case 'submit':                        
                        switch (myForm.main.formModes.current) {
                            case 'add':
                                if(!app.forms.validate()) return;
                                
                                for (let key in myForm.dbData.cels) {
                                    if(key==myForm.dbData.key && myForm.dbData.cels[key]=='-1') { data[key] = myForm.dbData.lastSelectedKey; continue;}
                                    let el = document.getElementById(myForm.dbData.cels[key]);
                                    if (el == null || el == undefined) { data[key] = app.helper.html.getRadioGroupValue(myForm.dbData.cels[key]); }
                                    else { data[key] = el.value; }
                                }
                                dbRes = app.db.insertIntoTable(myForm.dbData.table, data); 
                                if(dbRes.success) {
                                    app.forms.selects.itemEdit.updateData();
                                    app.forms.clear();
                                    app.helper.message.set(dbRes.message,'info');
                                }
                                else { app.helper.message.set(dbRes.message,'warning'); }

                                break;
                            case 'edit':
                                if(!app.forms.validate()) return;
                                
                                if(app.forms.selects.itemEdit.lastSelectedKey.isEmpty()){
                                    app.helper.message.set('Please select an item first!', 'warning');
                                    return;
                                }
                                
                                for (let key in myForm.dbData.cels) {
                                    if(key==myForm.dbData.key && myForm.dbData.cels[key]=='') { data[key] = myForm.dbData.lastSelectedKey; continue;}
                                    let el = document.getElementById(myForm.dbData.cels[key]);
                                    if (el == null || el == undefined) { data[key] = app.helper.html.getRadioGroupValue(myForm.dbData.cels[key]); }
                                    else { data[key] = el.value; }
                                }
                                dbRes = app.db.updateTable(myForm.dbData.table, myForm.dbData.lastSelectedKey, data); 
                                if(dbRes.success) {
                                    app.forms.selects.itemEdit.updateData(true);
                                    app.helper.message.set(dbRes.message,'info');
                                }
                                else { app.helper.message.set(dbRes.message,'warning'); }

                                break;
                            default: break;
                        }
                        break;
                    case 'delete':
                        if(app.forms.selects.itemEdit.lastSelectedKey.isEmpty()){
                            app.helper.message.set('Please select an item first!', 'warning');
                            return;
                        }
                        
                        dbRes = app.db.deleteFromTable(myForm.dbData.table, myForm.dbData.lastSelectedKey);
                        if(dbRes.success) { 
                            app.forms.clear();
                            app.helper.message.set(dbRes.message,'info');
                        }
                        else { app.helper.message.set(dbRes.message,'warning'); }
                        break;
                    case 'reset':
                        app.forms.clear();
                        break;
                    default:break;
                }
            }
        },
        validate:function(){
            let errors = [];

            let myForm = app.data.myForm;
            Object.values(myForm.dbData.cels).forEach(id=>{
                let val = app.helper.html.getInputValueDecideFromIdElseTryName(id);
                let type = app.helper.html.getInputTypeByIdElseTryName(id);
                switch(type){
                    case 'radio': break;
                    default:
                        let el = document.getElementById(id);
                        if(el.hasAttribute('disabled')) break;

                        if(el.hasAttribute('required') && el.value == ''){ errors.push(`'${el.alt}' is required.`); }

                        if(el.hasAttribute('min') || el.hasAttribute('max')) {
                            if(!app.helper.misc.isNumber(val)){
                                errors.push(`'${el.alt}' must be a Number.`);
                            }
                            else{
                                if(el.hasAttribute('min') && Number(val)<Number(el.min)) { errors.push(`'${el.alt}' must be greater or equal to ${el.min}.`); }
                                if(el.hasAttribute('max') && Number(val)>Number(el.max)) { errors.push(`'${el.alt}' must be smaller or equal to ${el.max}.`); }
                            }
                        }
                        
                        if(el.hasAttribute('minLength') && val.length < Number(el.minLength)){ errors.push(`'${el.alt}' must be at least ${el.minLength} characters.`); }
                        if(el.hasAttribute('maxLength') && val.length > Number(el.maxLength)){ errors.push(`'${el.alt}' must be at maximum ${el.maxLength} characters.`); }
                    break;
                }
            });

            if(errors.length>0){
                app.helper.message.set(errors.join('<br>'),'warning');
                return false;
            }
            return true;
        }
    },
    db:{
        init:function(data){
            if(typeof(Storage)=='undefined'){ alert('Web Storage not supported on your browser\nPlease change your browser now :D'); return false; }

            Object.keys(data).forEach(k=>{
                if(localStorage.getItem(k)===null){
                    localStorage.setItem(k,JSON.stringify(data[k]));
                }
            });

            return true;
        },
        tableResult: function (success, message='', data=[]) {
            return { success: success, message: message, data: data };
        },
        convertData:function(data){
            for(let p in data){ data[p] = app.helper.misc.tryParseNumberElseString(data[p]); }
            return data;
        },
        checkForAllReadyResInDb:function(data,dbTable,key){
            for (let i = 0; i < dbTable.length; i++) {
                let allEqual = true;
                for (let [k, v] of Object.entries(dbTable[i])){
                    if(k==key) { continue; }
                    if(v != data[k]) { allEqual=false; break; }
                }
                if(allEqual) { return true; }
            }
            return false;
        },
        insertIntoTable: function (tableName,data,successMessage='') {
            let myForm = app.data.myForm;
            let table = JSON.parse(localStorage.getItem(tableName));
            data = app.db.convertData(data);
            

            if (myForm.dbData.autoKey != '') { data[myForm.dbData.key] = (table[table.length - 1][myForm.dbData.key] + 1); }

            if (app.db.checkForAllReadyResInDb(data, table, myForm.dbData.key)) {
                if(!confirm('A same record appears in db!\nDo you want to continue adding this record?')){
                    return this.tableResult(false, 'A same record appears in db!<br>Operation canceled by user.')
                }
            }
            
            for (let i = 0; i < table.length; i++) {
                if (table[i][myForm.dbData.key] == data[myForm.dbData.key]) {
                    return this.tableResult(false, 'The same key already exists.<br>Please choose another key');
                }

            }
            table.push(data);
            try {
                localStorage.setItem(tableName, JSON.stringify(table));
                return this.tableResult(true, (successMessage != '' ? successMessage : 'Save was successed!'));
            } catch(e){
                return this.tableResult(false, 'Something went wrong, please try again.');
            }
            
        },
        updateTable:function(tableName,updateKey,data){
            let myForm = app.data.myForm;
            let table = JSON.parse(localStorage.getItem(tableName));
            data = app.db.convertData(data);

            for(let i=0;i<table.length;i++){
                if(table[i][myForm.dbData.key]==updateKey){
                    table[i]=data; break;
                }
            }
            try{
                localStorage.setItem(tableName,JSON.stringify(table));
                return this.tableResult(true,'Save was successed!');
            } catch(e){
                return this.tableResult(false,'Something went wrong, please try again.');
            }
        },
        deleteFromTable:function(tableName,deleteKey){
            let myForm = app.data.myForm;
            let table = JSON.parse(localStorage.getItem(tableName));
            let deleteIndex = -1;
            for(let i=0;i<table.length;i++){
                if(table[i][myForm.dbData.key]==deleteKey){ deleteIndex=i; break; }
            }
            if(deleteIndex>-1){ table.splice(deleteIndex,1); }
            else {return this.tableResult(false,'There is nothing to delete!');}
            
            try{
                localStorage.setItem(tableName,JSON.stringify(table));
                return this.tableResult(true,'Delete was successed!');
            } catch(e){
                return this.tableResult(false,'Something went wrong, please try again.');
            }
        },
        deleteFromTableWhereCells:function(tableName,cellsObj){
            let myForm = app.data.myForm;
            let table = JSON.parse(localStorage.getItem(tableName));

            let deleteIndex = -1;
            for_1: for (let i = 0; i < table.length; i++) { 
                for (let [k, v] of Object.entries(cellsObj)) { if (table[i][k] != v) { continue for_1; } }
                deleteIndex = i;
            }
            
            if(deleteIndex>-1){ table.splice(deleteIndex,1); }
            else {return this.tableResult(false,'There is nothing to delete!');}
            
            try{
                localStorage.setItem(tableName,JSON.stringify(table));
                return this.tableResult(true,'Delete was successed!');
            } catch(e){
                return this.tableResult(false,'Something went wrong, please try again.');
            }
        },
        selectFromTable:function(tableName,columnsAr,whereCellName,whereValue){
            let table = JSON.parse(localStorage.getItem(tableName));
            let out = [];
            if(whereCellName){
                table.forEach(row=>{
                    if(row[whereCellName]!=whereValue) return;
                    let o = {}; for(const key of columnsAr){o[key]=row[key]}; out.push(o);
                });
            }
            else{
                table.forEach(row=>{
                    let o = {}; for(const key of columnsAr){o[key]=row[key]}; out.push(o);
                });
            }

            if(out.length>0){
                return this.tableResult(true,'',out);
            }
            else{
                return this.tableResult(false,'No records found!');
            }
        },
        countTable:function(tableName){
            let table = JSON.parse(localStorage.getItem(tableName));
            return table.length;
        }
    }
};

(function(){ app.start(); })();

