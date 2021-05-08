var budgetcontroller = (function(){
    var expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    
    var data ={
        alltotal: {
            inc: [],
            exp: []
        },
        total: {
            inc:0,
            exp:0,
        },
        budget:0,
        persentage:-1
    };

    var calculatetotal = function(type){
       var sum = 0;
        data.alltotal[type].forEach(function(cur){
            sum += cur.value;
        });
        data.total[type]= sum;
    };


    return{
        additem:function(type,des,val){
            var newitem,ID;

            ID =data.alltotal[type].length; 

            if(type === 'exp')
            {
                newitem = new expense(ID,des,val);
                data.alltotal[type].push(newitem);
            }
            else if(type === 'inc'){
                newitem = new income(ID,des,val);
                data.alltotal[type].push(newitem);
            }
            return newitem;
        },
        calculatebudget:function(){
            //totel income and expense
                calculatetotal('inc');
                calculatetotal('exp');
            
            // caculate total budget
                data.budget = data.total.inc - data.total.exp;
        
            //calculate persentage
            if(data.total.inc === 0){
                data.persentage = '0';
            } else
                data.persentage = Math.round(( data.total.exp /  data.total.inc) * 100);
        },
        getbudget:function(){
            return{
                budget: data.budget,
                income: data.total.inc,
                expense: data.total.exp,
                persentage: data.persentage

            }
        },
        deleteitem:function(type,id){
            var ids,index;

            ids= data.alltotal[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            if(index !== -1){
                data.alltotal[type].splice(index,1);
            }
        },
        testing: function(){
            console.log(data);
        }
    };

})();

var uicontroller = (function(){

    var formatcontroller = function(num,type){
        
        num = Math.abs(num);
        num = num.toFixed(2);
        splitnum = num.split('.');
        int = splitnum[0];
        dec = splitnum[1];
        //2345
        if(int.length >3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3); 
        } 

        return (type === 'exp' ? '-':'+')+ ' ' + int + '.' + dec;
    };

    return{
        getinput:function(){
            return{
                type: document.querySelector('.add__type').value,
                description : document.querySelector('.add__description').value,
                values : parseFloat(document.querySelector('.add__value').value) 
            };
        },
        gethtml:function(obj,type){
            var html,newhtml,element;
            if(type === 'inc'){
                element='.income__list';
                html = '<div class="item clearfix" id=inc-%id%><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if(type === 'exp'){
                element='.expenses__list';
                html = '<div class="item clearfix" id=exp-%id%><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newhtml=html.replace('%id%',obj.id);
            newhtml=newhtml.replace('%description%',obj.description);
            newhtml=newhtml.replace('%value%',formatcontroller(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
            
        }, 
        clearfields:function(){
            var field,fieldarr;

            field=document.querySelectorAll('.add__description'+',' +'.add__value');
            fieldarr= Array.prototype.slice.call(field);
            fieldarr.forEach(function(current, index, array) {
                current.value="";
            });
            fieldarr[0].focus(); 
        },
        displaybudget: function(obj){
            var type;
            obj.budget > 0 ? type ='inc':type = 'dec';
            document.querySelector('.budget__value').textContent = formatcontroller(obj.budget,type);
            document.querySelector('.budget__income--value').textContent = formatcontroller(obj.income,'inc');
            document.querySelector('.budget__expenses--value').textContent = formatcontroller(obj.expense,'exp');
            if(obj.persentage > 0){
                document.querySelector('.budget__expenses--percentage').textContent = obj.persentage + '%';
            }else{
                document.querySelector('.budget__expenses--percentage').textContent = '---';
            }
        },
        deletebudget: function(sourseid){
            var el;
            el = document.getElementById(sourseid);
            el.parentNode.removeChild(el);
        },
        displaymonth: function(){
            var now,day,months,month,year;
            now = new Date;
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            year = now.getFullYear();
            month = now.getMonth();
            //day = now.getDay();

            document.querySelector('.budget__title--month').textContent = months[month]+' '+year;
        }
    };
    

})();


var controller = (function(budgetconlr,uicontlr){

    var updatebudget = function(){
        budgetconlr.calculatebudget();
        var budget = budgetconlr.getbudget();

        uicontlr.displaybudget(budget);

    };

    
    var addconlr = function(){
        //take input from ui
        var input = uicontlr.getinput();
        // make ds of discription and value
        if(input.description !== "" && input.values > 0){
            var newitem = budgetconlr.additem(input.type,input.description,input.values); 
        // print income and expense in ui    
            uicontlr.gethtml(newitem,input.type);
        // delete 
            uicontlr.clearfields();

            updatebudget();
        }
        
    };


    var deleteconlr = function(event){
        // update in budget and ds
        var itemid,item,type,id;
        itemid = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemid){
            item = itemid.split('-');
            type = item[0];
            id = parseInt(item[1]);
            budgetconlr.deleteitem(type,id);

            // update in ui
            uicontlr.deletebudget(itemid);
            // update budget
            updatebudget();
        }
        

    };


    
    document.querySelector('.add__btn').addEventListener('click',addconlr);

    document.addEventListener('keypress',function(event){
        if(event.keycode === 13 || event.which === 13){
            addconlr();
        }
    });

    document.querySelector('.container').addEventListener('click',deleteconlr);

})(budgetcontroller,uicontroller);

uicontroller.displaymonth();