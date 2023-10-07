import * as React from 'react';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {FormikProvider, Form, useFormik} from 'formik';
import {FormLabel, FormControl, FormControlLabel, Checkbox, Alert, Snackbar, OutlinedInput, Box, Button, Container, InputAdornment} from '@mui/material';
import MasterCard from '@/assets/mastercard.svg';
import Visa from '@/assets/visa.svg';

type Props = {
    orderId: string;
}

type OrderDetails = {
    id: string,
    shop_id: string,
    status: "EXPIRED" | "UNPAID" | "ON_HOLD" | "PAID",
    created_at: string,
    amount: number,
    currency: string,
    capture_method: "AUTO" | "MANUAL",
    external_id: string,
    description: string,
    extra_info: Record<string, any>,
    attempts: 50,
    due_date: string,
    customer_id: string,
    card_id: string,
    back_url: string,
    success_url: string,
    failure_url: string,
    template: string,
    checkout_url: string,
    access_token: string,
    mcc: string
}

/* Form validation */
const validationSchema = Yup.object().shape({
    card_expire: Yup.string().max(5).required().test({
        test(value, ctx) {
            if(value.length < 5) {
                return false;
            }
            const arr = value.split('/');
            if (arr[0].length !== 2 || arr[1].length !== 2) {
                return false;
            } else {
                if(Number(arr[0]) > 0 && Number(arr[0]) <= 12) {
                    return true;
                }
            }
            throw ctx.createError({message: 'not correct'});
        }
    }),
    card_cvv: Yup.number().required('This field is required')
    .test('is-three-digits',
        'Must be a 3-digit number',
        (value) => value >= 100 && value <= 999
      ),
    card_number: Yup.string().required().test((val) => val.length === 19).typeError('please provide a correct card number')
});

const classes = {
    error: {
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #d32f2f',
            outline: 'none',
        }
    }
  };

const CardForm = ({orderId}: Props) => {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | undefined>(undefined);
    const [openSuccess, setOpenSuccess] = useState<boolean>(false);
    const [openFailure, setOpenFailure] = useState<boolean>(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_BASE_URL + '/v2/orders/' + orderId).then((res) => res.data);
                setOrderDetails(res);
            } catch(e) {
                console.log('error', e);
            }
        }
        fetch();
    }, []);

    const handleSubmit = async () => {        
        await axios.post(`${import.meta.env.VITE_BASE_URL}/v2/orders/${orderId}/payments/car`, {
            pan: formik.values.card_number,
            exp: formik.values.card_expire,
            cvc: formik.values.card_cvv,
            holder: "",
            save: formik.values.card_save,
            email: "user@example.com",
            phone: "+7777777777",
            card_id: "",
            fingerprint: "",
            phone_check_date: "",
            channel: "WEB"
        })
        .then(() => setOpenSuccess(true))
        .catch(() => setOpenFailure(true));
    }

    const formik = useFormik({
        initialValues: {card_expire: '', card_cvv: '', card_number: '', card_save: false},
        validateOnBlur: true,
        onSubmit: handleSubmit,
        validationSchema
    });

    const handleCardExpire = (e: React.ChangeEvent & {target: HTMLInputElement}) => {
        if(formik.values.card_expire.length === 1 && e.target.value.length === 2) {
            formik.setValues({...formik.values, card_expire: e.target.value + '/'})
            return;
        }
        formik.setValues({...formik.values, card_expire: e.target.value})
    }

    return (
        <>
        <Container sx={{paddingTop: '20px', width: '400px', height: '400px', border: '1px solid black'}}>
            <FormikProvider value={formik}>
                <Form>
                    <FormControl color={formik.errors.card_number ?  'error' : 'primary'} sx={formik.errors.card_number ? {...classes.error, width: '100%'} : {width: '100%'}}>
                        <FormLabel htmlFor="card-number"  style={{marginRight: 'auto', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>Номер карты</FormLabel>
                        <OutlinedInput name="card_number"  placeholder={'4444 4444 4444 4444'} id="card-number" onChange={formik.handleChange} sx={{borderRadius: '10px', height: '50px'}} endAdornment={
                                    <InputAdornment position="end">
                                        {formik.values.card_number.startsWith('5') 
                                            ? <img src={MasterCard}/> 
                                            : formik.values.card_number.startsWith('4') 
                                            ? <img src={Visa}/> 
                                            : null}
                                    </InputAdornment>}
                        />
                    </FormControl>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', padding: '0 !important', gap: '30px', marginTop: '10px'}}>
                        <FormControl  color={formik.errors.card_expire ?  'error' : 'primary'} sx={formik.errors.card_expire ? classes.error : {}}>
                            <FormLabel htmlFor="card-expiration"  style={{width: 'fit-content', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>Срок карты</FormLabel>
                            <OutlinedInput placeholder={'12/34'} name="card_expire" id="card-expirtation" value={formik.values.card_expire} onChange={handleCardExpire} onBlur={formik.handleBlur} sx={{borderRadius: '10px', height: '50px'}}/>
                        </FormControl>
                        <FormControl color={formik.errors.card_cvv ?  'error' : 'primary'} sx={formik.errors.card_cvv ? classes.error : {}}>
                            <FormLabel htmlFor="card-cvv"  style={{width: 'fit-content', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>CVV</FormLabel>
                            <OutlinedInput onChange={formik.handleChange} name="card_cvv" placeholder={'123'}  id="card-cvv" sx={{borderRadius: '10px', height: '50px'}} />
                        </FormControl>
                    </Box>
                    <FormControlLabel name="card_save" onChange={formik.handleChange} control={<Checkbox />} label="Сохранить карту на этом сайте" sx={{display: 'flex', alignSelf: 'flex-start'}}/>
                    <Button disabled={!formik.isValid} variant="contained" onClick={() => formik.handleSubmit()} sx={{width: '100%', backgroundColor: 'black', borderRadius: '10px', marginTop: '20px', '&:hover': {
                        backgroundColor: 'white', color: 'black', border: '0.5px solid black'
                    }, '&:focus': {outline: 'none'}}}>Оплатить {orderDetails?.amount ?? 0}₸</Button>
                </Form>
            </FormikProvider>
        </Container>
        <Snackbar
            open={openSuccess}
            autoHideDuration={3000}
            onClose={() => setOpenSuccess(false)}
        >
            <Alert severity="success">
                Payment successful!
            </Alert>
        </Snackbar>
        <Snackbar
            open={openFailure}
            autoHideDuration={3000} 
            onClose={() => setOpenFailure(false)}
        >
            <Alert severity="error">
                Payment failed. Please try again.
            </Alert>
      </Snackbar>
        </>
    )
}

export default CardForm;