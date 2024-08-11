function httpGetAsync(optionalParams) {
    // Valores que identifican la aplicación para generar el token
    const SITE = 'MCU_004';
    const TENANT_ID = 'eafit.edu.co';
    const APPLICATION_ID = 'c891818e-2db1-4cae-8b15-35179b14941f';

    // Servicio que genera el token token
    const paramsToken = `${TENANT_ID}/${APPLICATION_ID}.${SITE}`
	const url = `https://mcu-svc.azurewebsites.net/api/generateToken/${paramsToken}`;

	    // Url del sitio donde se encuentra alojado el proyecto MCU
    const urlMCU = `https://mcu.azureedge.net/`;

    // Parámetros que se adicionarán a la url de redirección
    const params = btoa(unescape(encodeURIComponent(optionalParams)))

    const elem = document.getElementById('mainbutton');
    elem.disabled = true;

    fetch(url)
        .then(response => {
            elem.disabled = false;
            return response.json();
        })
        .then(resp => {
            if (resp) {
                console.log("Respuesta:", resp);
                redirectTo = `${urlMCU}?token=${resp.token}&site=${SITE}&params=${params}`
                console.log(redirectTo);
                window.open(redirectTo);
            }
        })
        .catch(error => {
            console.log(error);
            window.open(`${urlMCU}`);
        });
}