import { supabase } from './supabaseClient.js';

// Load form token data when the form page opens
// The token comes from the URL: ?token=xxxx
export async function loadFormByToken(token) {
  const { data, error } = await supabase
    .from('form_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) {
    throw new Error('This form link is invalid or has expired.');
  }

  if (data.status === 'submitted') {
    throw new Error('This form has already been submitted.');
  }

  return data;
}

// Submit the completed form
export async function submitForm(token, answers) {
  const { error } = await supabase
    .from('form_tokens')
    .update({
      status: 'submitted',
      answers: answers,
      submitted_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (error) throw new Error('Failed to submit form. Please try again.');
}

// Upload an attachment file to Supabase storage
export async function uploadAttachment(file) {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (error) throw new Error('Failed to upload file.');

  const { data: urlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(data.path);

  return {
    name: file.name,
    url: urlData.publicUrl,
    type: file.type,
    size: file.size,
  };
}
