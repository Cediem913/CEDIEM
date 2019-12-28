exports.paginate = async function (page_actual,page_size,final) {
    var footer = [];

    for(var i= 1; i<=final; i++){
        var flag = false;
        var active = false;
        var dummy = false;

        if(i== page_actual)
            active=true;
        if(i==final || i==1)
            flag=true;
        
        //console.log(i +">="+(page_actual-page_size) + " && "+ i +"<="+(page_actual + page_size))
        //console.log((i >= (page_actual - page_size)) + " && " + (i <= (page_actual + page_size)))
        if((i >= (page_actual - page_size)) && (i <= (page_actual + page_size)))
            flag=true;
        
        if(flag){
            var result = {value:i,actual:false,disabled:false,active:true};
            if(active)
                result.actual = true;
            if(dummy){
                result.disabled = true;
                result.active = false;
            }
            footer.push(result);
        }else{
            continue;
        }
    }
    return footer;
}

exports.validateNumber = async function (number) {
    var result = false;
    if(!Number.isNaN(Number.parseInt(number))){
        result = true;
    }
    return result;
}

exports.validateDate = async function (number) {
    var result = true;
    var year = number.substring(0,4);
    var month = number.substring(5,7);
    var day = number.substring(8,10);
    if(number.length == 10){
        if(Number.isNaN(Number.parseInt(year)) || Number.isNaN(Number.parseInt(month)) || Number.isNaN(Number.parseInt(day))){
            result = false;
        }
    }else{
        result = false;
    }
    return result;
}